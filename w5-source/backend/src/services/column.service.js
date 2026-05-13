import ColumnRepo from '~/repo/column.repo'
import BoardRepo from '~/repo/board.repo'
import CardRepo from '~/repo/card.repo'
import {
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import { mongoClientInstance } from '~/config/mongodb'
import ActivityLogRepo from '~/repo/activityLog.repo'
import { ObjectId } from 'mongodb'
import S3Provider from '~/providers/S3Provider'
import AttachmentRepo from '~/repo/attachment.repo'
import CommentRepo from '~/repo/comment.repo'
import TaskRepo from '~/repo/task.repo'
import WorkspaceRepo from '~/repo/workspace.repo'
import { getActiveSubscriptionCached } from '~/helpers/subscription.cache'
import {
  emitColumnArchived,
  emitColumnCreated,
  emitColumnDeleted,
  emitColumnRestored,
  emitColumnUpdated
} from '~/realtime/realtimeEmitters/columnRealtime.emitter'

class ColumnService {
  static fetchArchived = async ({ boardId }) => {
    const archivedItems = await ColumnRepo.findMany({
      filter: { boardId, status: 'archived' }
    })

    return archivedItems
  }

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
      return await session.withTransaction(async () => {
        const createColumnData = {
          ...data,
          boardId: boardAccess.board._id.toString()
        }

        const columnCount = await ColumnRepo.count({
          filter: { boardId: boardAccess.board._id.toString() },
          options: { session }
        })

        if (columnCount >= features.limits.maxColumnsPerBoard)
          throw new ForbiddenErrorResponse(
            'This board has reached its column limit.'
          )

        const createdColumn = await ColumnRepo.createOne({
          data: createColumnData,
          session
        })

        const column = await ColumnRepo.findById({
          _id: createdColumn.insertedId,
          session
        })

        if (column) {
          column.cards = []
          await BoardRepo.pushColumnOrderIds({ column, session })
        }

        await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'column',
            entityId: createdColumn.insertedId.toString(),
            action: 'column.create',
            content: `added column "${column.title}"`
          },
          session
        })

        emitColumnCreated({
          boardId: boardAccess.board._id.toString(),
          column
        })

        return column
      })
    } finally {
      await session.endSession()
    }
  }

  static update = async ({ _id, data, boardAccess }) => {
    const column = await ColumnRepo.findOne({
      filter: {
        _id: new ObjectId(_id),
        boardId: boardAccess.board._id,
        status: 'active'
      }
    })

    if (!column) throw new NotFoundErrorResponse('Column not found.')

    if ('color' in data && data.color !== 'default') {
      const subscription = await getActiveSubscriptionCached({
        workspaceId: boardAccess.board.workspaceId
      })

      if (!subscription)
        throw new NotFoundErrorResponse(
          'Subscription not found for this workspace.'
        )

      const features = subscription.planFeatureSnapshot

      if (!features?.capabilities?.column?.customColor)
        throw new ForbiddenErrorResponse(
          'Your current subscription plan does not allow creating custom colors for columns.'
        )
    }

    const updateData = { ...data, updatedAt: new Date() }

    const updatedColumn = await ColumnRepo.updateById({ _id, data: updateData })

    emitColumnUpdated({
      boardId: boardAccess.board._id.toString(),
      column: updatedColumn
    })

    return updatedColumn
  }

  static archive = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()

    try {
      return await session.withTransaction(async () => {
        const column = await ColumnRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id,
            status: 'active'
          },
          options: { session }
        })

        if (!column) throw new NotFoundErrorResponse('Column not found.')

        const updatedColumn = await ColumnRepo.updateById({
          _id,
          data: { status: 'archived', updatedAt: new Date() },
          session
        })

        await BoardRepo.pullColumnOrderIds({ column, session })

        await ActivityLogRepo.createOne({
          data: {
            boardId: column.boardId.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'column',
            entityId: column._id.toString(),
            action: 'column.archive',
            content: `archived column "${column.title}"`
          },
          session
        })

        emitColumnArchived({
          boardId: boardAccess.board._id.toString(),
          column: updatedColumn
        })

        return updatedColumn
      })
    } finally {
      await session.endSession()
    }
  }

  static restore = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()

    try {
      const updatedColumn = await session.withTransaction(async () => {
        const column = await ColumnRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id,
            status: 'archived'
          },
          options: { session }
        })

        if (!column) throw new NotFoundErrorResponse('Column not found.')

        const updated = await ColumnRepo.updateById({
          _id,
          data: { status: 'active', updatedAt: new Date() },
          session
        })

        await BoardRepo.pushColumnOrderIds({ column, session })

        await ActivityLogRepo.createOne({
          data: {
            boardId: column.boardId.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'column',
            entityId: column._id.toString(),
            action: 'column.restore',
            content: `restored column "${column.title}"`
          },
          session
        })

        return updated
      })

      const columnDetail = await ColumnRepo.getDetail({
        _id: updatedColumn._id
      })

      emitColumnRestored({
        boardId: boardAccess.board._id.toString(),
        column: columnDetail
      })

      return columnDetail
    } finally {
      await session.endSession()
    }
  }

  static delete = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()
    let fileKeys = []

    let deletedColumn = null
    try {
      await session.withTransaction(async () => {
        const column = await ColumnRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString(),
            status: 'archived'
          },
          options: { session }
        })

        if (!column) throw new NotFoundErrorResponse('Column not found.')

        const board = await BoardRepo.findOne({
          filter: { _id: new ObjectId(column.boardId) },
          options: { session }
        })

        if (!board) throw new NotFoundErrorResponse('Board not found.')

        const cards = await CardRepo.findMany({
          filter: { columnId: column._id.toString() },
          options: { session }
        })

        const cardIds = cards.map((card) => card._id.toString())

        if (cardIds.length > 0) {
          const attachments = await AttachmentRepo.findMany({
            filter: { cardId: { $in: cardIds } },
            options: { session }
          })

          fileKeys = attachments?.map((item) => item.fileKey) ?? []

          const totalAttachmentSize = attachments.reduce(
            (sum, item) => sum + (item.fileSize || 0),
            0
          )

          await CommentRepo.deleteMany({
            filter: { cardId: { $in: cardIds } },
            session
          })

          await AttachmentRepo.deleteMany({
            filter: { cardId: { $in: cardIds } },
            session
          })

          await TaskRepo.deleteMany({
            filter: { cardId: { $in: cardIds } },
            session
          })

          await CardRepo.deleteMany({
            filter: { columnId: column._id.toString() },
            session
          })

          if (totalAttachmentSize > 0) {
            await WorkspaceRepo.updateOne({
              filter: { _id: new ObjectId(board.workspaceId) },
              data: {
                $inc: { storageUsed: -totalAttachmentSize },
                $set: { updatedAt: new Date() }
              },
              session
            })
          }
        }

        await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'column',
            entityId: column._id.toString(),
            action: 'column.delete',
            content: `deleted column "${column.title}"`
          },
          session
        })

        deletedColumn = await ColumnRepo.deleteById({
          _id,
          session
        })

        await BoardRepo.pullColumnOrderIds({
          column,
          session
        })
      })

      if (fileKeys.length > 0) await S3Provider.deleteMany(fileKeys)

      return deletedColumn
    } finally {
      await session.endSession()
    }
  }
}
export default ColumnService
