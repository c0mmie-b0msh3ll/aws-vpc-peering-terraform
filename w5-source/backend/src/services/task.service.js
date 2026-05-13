import { ObjectId } from 'mongodb'
import { mongoClientInstance } from '~/config/mongodb'
import {
  BadRequestErrorResponse,
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import { getActiveSubscriptionCached } from '~/helpers/subscription.cache'
import { emitCardUpdatedBasic } from '~/realtime/realtimeEmitters/cardRealtime.emitter'
import {
  emitTaskCreated,
  emitTaskDeleted,
  emitTaskUpdated
} from '~/realtime/realtimeEmitters/taskRealtime.emitter'
import ActivityLogRepo from '~/repo/activityLog.repo'
import BoardMemberRepo from '~/repo/boardMember.repo'
import CardRepo from '~/repo/card.repo'
import TaskRepo from '~/repo/task.repo'

class TaskService {
  static create = async ({ boardAccess, data }) => {
    const subscription = await getActiveSubscriptionCached({
      workspaceId: boardAccess.board.workspaceId
    })

    if (!subscription)
      throw new NotFoundErrorResponse(
        'Subscription not found for this workspace.'
      )

    const features = subscription.planFeatureSnapshot

    const session = await mongoClientInstance.startSession()

    try {
      let insertedLog = null
      const result = await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(data.cardId),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        let parentTask = null

        if (data.parentTaskId) {
          parentTask = await TaskRepo.findOne({
            filter: {
              _id: new ObjectId(data.parentTaskId),
              cardId: data.cardId
            },
            options: { session }
          })

          if (!parentTask)
            throw new NotFoundErrorResponse('Parent task not found.')

          if (parentTask.parentTaskId)
            throw new BadRequestErrorResponse(
              'Cannot create a child task from another child task.'
            )

          if (card.taskCount >= features.limits.maxChecklistItemsPerCard)
            throw new ForbiddenErrorResponse(
              'This card has reached its task limit.'
            )

          if (data.dueAt && !features?.capabilities?.task?.setDue)
            throw new ForbiddenErrorResponse(
              'Your current subscription plan does not allow setting due dates for tasks.'
            )

          if (data.memberId && !features?.capabilities?.task?.assignMembers)
            throw new ForbiddenErrorResponse(
              'Your current subscription plan does not allow assigning members to tasks.'
            )
        }

        const createTaskData = {
          ...data,
          cardId: card._id.toString(),
          parentTaskId: parentTask ? parentTask._id.toString() : null
        }

        const createdResult = await TaskRepo.createOne({
          data: createTaskData,
          session
        })

        const createdTask = await TaskRepo.findOne({
          filter: { _id: new ObjectId(createdResult.insertedId) },
          options: { session }
        })

        let updatedCard = null

        if (parentTask) {
          updatedCard = await CardRepo.updateOne({
            filter: { _id: new ObjectId(card._id) },
            data: {
              $inc: {
                taskCount: 1,
                completedTaskCount: createdTask.isCompleted ? 1 : 0
              },
              $set: { updatedAt: new Date() }
            },
            session
          })
        } else {
          insertedLog = await ActivityLogRepo.createOne({
            data: {
              boardId: boardAccess.board._id.toString(),
              authorId: boardAccess.boardMember._id.toString(),
              authorType: 'boardMember',
              entityType: 'card',
              entityId: card._id.toString(),
              action: 'card.task.create',
              content: `added checklist "${createdTask.content}" to card "${card.title}"`
            },
            session
          })
        }

        return {
          task: createdTask,
          card: updatedCard
        }
      })

      if (result.card)
        emitCardUpdatedBasic({
          boardId: boardAccess.board._id,
          card: result.card
        })

      let createdLog = null

      if (insertedLog) {
        createdLog = await ActivityLogRepo.findOne({
          filter: { _id: new ObjectId(insertedLog.insertedId) }
        })
        emitTaskCreated({
          boardId: boardAccess.board._id,
          task: result.task,
          log: createdLog
        })
        return { ...result, log: createdLog }
      }

      emitTaskCreated({
        boardId: boardAccess.board._id,
        task: result.task,
        log: createdLog
      })

      return { ...result, log: null }
    } finally {
      await session.endSession()
    }
  }

  static update = async ({ _id, boardAccess, data }) => {
    const session = await mongoClientInstance.startSession()

    try {
      const result = await session.withTransaction(async () => {
        const task = await TaskRepo.findOne({
          filter: { _id: new ObjectId(_id) },
          options: { session }
        })

        if (!task) {
          throw new NotFoundErrorResponse('Task not existing.')
        }

        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(task.cardId),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) {
          throw new NotFoundErrorResponse('Card not found.')
        }

        if ('memberId' in data || 'dueAt' in data) {
          const subscription = await getActiveSubscriptionCached({
            workspaceId: boardAccess.board.workspaceId
          })

          if (!subscription) {
            throw new NotFoundErrorResponse(
              'Subscription not found for this workspace.'
            )
          }

          const features = subscription.planFeatureSnapshot

          if (
            data?.dueAt !== undefined &&
            !features?.capabilities?.task?.setDue
          ) {
            throw new ForbiddenErrorResponse(
              'Your current subscription plan does not allow setting due dates for tasks.'
            )
          }

          if (
            data?.memberId !== undefined &&
            !features?.capabilities?.task?.assignMembers
          ) {
            throw new ForbiddenErrorResponse(
              'Your current subscription plan does not allow assigning members to tasks.'
            )
          }
        }

        let completedTaskCountDelta = 0
        const isChildTask = !!task.parentTaskId

        if ('isCompleted' in data && isChildTask) {
          const nextIsCompleted = Boolean(data.isCompleted)

          if (task.isCompleted !== nextIsCompleted) {
            completedTaskCountDelta = nextIsCompleted ? 1 : -1
          }
        }

        if ('memberId' in data && isChildTask) {
          if (data.memberId) {
            const boardMember = await BoardMemberRepo.findOne({
              filter: {
                _id: new ObjectId(data.memberId),
                boardId: card.boardId
              },
              options: { session }
            })

            if (!boardMember)
              throw new BadRequestErrorResponse(
                'The selected member is not in this board.'
              )
          }
        }

        const updatedTask = await TaskRepo.updateOne({
          filter: { _id: new ObjectId(_id) },
          data: { $set: { ...data, updatedAt: new Date() } },
          session
        })

        let updatedCard = null

        if (completedTaskCountDelta !== 0) {
          updatedCard = await CardRepo.updateOne({
            filter: { _id: new ObjectId(task.cardId) },
            data: {
              $inc: { completedTaskCount: completedTaskCountDelta },
              $set: { updatedAt: new Date() }
            },
            session
          })
        }

        return { task: updatedTask, card: updatedCard }
      })

      if ('isCompleted' in data)
        emitCardUpdatedBasic({
          boardId: boardAccess.board._id,
          card: result.card
        })

      emitTaskUpdated({
        boardId: boardAccess.board._id,
        card: result.card,
        task: result.task
      })

      return result
    } finally {
      await session.endSession()
    }
  }

  static delete = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()
    let insertedLog = null
    try {
      const result = await session.withTransaction(async () => {
        const task = await TaskRepo.findOne({
          filter: { _id: new ObjectId(_id) },
          options: { session }
        })

        if (!task) {
          throw new NotFoundErrorResponse('Task not existing.')
        }

        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(task.cardId),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) {
          throw new NotFoundErrorResponse('Card not found.')
        }

        const isParentTask = !task.parentTaskId
        let childTasks = []

        if (isParentTask) {
          childTasks = await TaskRepo.findMany({
            filter: { parentTaskId: task._id.toString() },
            options: { session }
          })

          if (childTasks.length > 0) {
            await TaskRepo.deleteMany({
              filter: { parentTaskId: task._id.toString() },
              session
            })
          }
        }

        await TaskRepo.deleteOne({
          filter: { _id: new ObjectId(_id) },
          session
        })

        const deletedTaskCount = isParentTask ? childTasks.length : 1

        const deletedCompletedTaskCount = isParentTask
          ? childTasks.filter((item) => item.isCompleted).length
          : task.isCompleted
            ? 1
            : 0

        let updatedCard = null

        if (deletedTaskCount > 0 || deletedCompletedTaskCount > 0) {
          updatedCard = await CardRepo.updateOne({
            filter: { _id: new ObjectId(task.cardId) },
            data: {
              $inc: {
                taskCount: -deletedTaskCount,
                completedTaskCount: -deletedCompletedTaskCount
              },
              $set: { updatedAt: new Date() }
            },
            session
          })
        }

        if (isParentTask) {
          insertedLog = await ActivityLogRepo.createOne({
            data: {
              boardId: boardAccess.board._id.toString(),
              authorId: boardAccess.boardMember._id.toString(),
              authorType: 'boardMember',
              entityType: 'card',
              entityId: card._id.toString(),
              action: 'card.task.delete',
              content: `deleted checklist "${task.content}" from card "${card.title}"`
            },
            session
          })
        }

        return {
          task: {
            _id: task._id,
            parentTaskId: task.parentTaskId || null,
            cardId: task.cardId
          },
          card: updatedCard
        }
      })

      if (result?.card)
        emitCardUpdatedBasic({
          boardId: boardAccess.board._id,
          card: result.card
        })

      let createdLog = null

      if (insertedLog) {
        createdLog = await ActivityLogRepo.findOne({
          filter: { _id: new ObjectId(insertedLog.insertedId) },
          options: { session }
        })
        emitTaskDeleted({
          boardId: boardAccess.board._id,
          task: result.task,
          log: createdLog
        })
        return { ...result, log: createdLog }
      }

      emitTaskDeleted({
        boardId: boardAccess.board._id,
        task: result.task,
        log: createdLog
      })

      return { ...result, log: null }
    } finally {
      await session.endSession()
    }
  }
}
export default TaskService
