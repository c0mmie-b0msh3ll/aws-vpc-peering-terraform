import CardRepo from '~/repo/card.repo'
import ColumnRepo from '~/repo/column.repo'
import { ObjectId } from 'mongodb'
import {
  BadRequestErrorResponse,
  ConflictErrorResponse,
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import { mongoClientInstance } from '~/config/mongodb'
import CommentRepo from '~/repo/comment.repo'
import TaskRepo from '~/repo/task.repo'
import BoardMemberRepo from '~/repo/boardMember.repo'
import AttachmentRepo from '~/repo/attachment.repo'
import S3Provider from '~/providers/S3Provider'
import LabelRepo from '~/repo/label.repo'
import ActivityLogRepo from '~/repo/activityLog.repo'
import WorkspaceRepo from '~/repo/workspace.repo'
import BoardRepo from '~/repo/board.repo'
import { getActiveSubscriptionCached } from '~/helpers/subscription.cache'
import {
  emitCardCreated,
  emitCardUpdatedBasic
} from '~/realtime/realtimeEmitters/cardRealtime.emitter'

class CardService {
  static fetchArchived = async ({ boardId }) => {
    const archivedItems = await CardRepo.findMany({
      filter: { boardId, status: 'archived' }
    })

    return archivedItems
  }

  static fetchDetail = async ({ _id }) => {
    const [cardDetail, comments, checklists, attachments, logs] =
      await Promise.all([
        CardRepo.findOne({ filter: new ObjectId(_id) }),
        CommentRepo.getByCardId({ cardId: _id }),
        TaskRepo.getListByCardId({ cardId: _id }),
        AttachmentRepo.findMany({
          filter: { cardId: _id },
          options: { sort: { createdAt: -1 } }
        }),
        ActivityLogRepo.findMany({
          filter: { entityType: 'card', entityId: _id },
          options: { sort: { createdAt: -1 } }
        })
      ])

    if (!cardDetail) throw new NotFoundErrorResponse('Card not found.')

    const attachmentsWithUrl = attachments?.map((a) => ({
      ...a,
      url: S3Provider.getUrl(a.fileKey)
    }))

    return {
      cardDetail,
      comments,
      checklists,
      attachments: attachmentsWithUrl,
      logs
    }
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
        const column = await ColumnRepo.findOne({
          filter: {
            _id: new ObjectId(data.columnId),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!column) throw new NotFoundErrorResponse('Column not found.')

        const cardCount = await CardRepo.count({
          filter: { boardId: boardAccess.board._id.toString() },
          options: { session }
        })

        if (cardCount >= features.limits.maxCardsPerBoard)
          throw new ForbiddenErrorResponse(
            'This board has reached its card limit.'
          )

        const createdCard = await CardRepo.createOne({
          data: {
            ...data,
            boardId: boardAccess.board._id.toString(),
            columnId: column._id.toString()
          },
          session
        })

        const card = await CardRepo.findOne({
          filter: { _id: new ObjectId(createdCard.insertedId) },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        await ColumnRepo.pushCardOrderIds({ card, session })

        await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'card',
            entityId: createdCard.insertedId.toString(),
            action: 'card.create',
            content: `added card "${card.title}"`
          },
          session
        })

        emitCardCreated({
          boardId: boardAccess.board._id,
          card
        })

        return card
      })
    } finally {
      await session.endSession()
    }
  }

  static updateBasic = async ({ _id, boardAccess, data }) => {
    const session = await mongoClientInstance.startSession({
      causalConsistency: false
    })
    try {
      let insertedLogs = null
      const updatedCard = await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        if ('description' in data)
          data.isHasDescription = !!data.description?.trim()

        const updatedCard = await CardRepo.updateOne({
          filter: { _id: new ObjectId(_id) },
          data: { $set: data },
          session
        })

        if ('isCompleted' in data) {
          const message = updatedCard.isCompleted
            ? `marked card "${card.title}" complete`
            : `marked card "${card.title}" incomplete`

          insertedLogs = await ActivityLogRepo.createOne({
            data: {
              boardId: boardAccess.board._id.toString(),
              authorId: boardAccess.boardMember._id.toString(),
              authorType: 'boardMember',
              entityType: 'card',
              entityId: updatedCard._id.toString(),
              action: data.isCompleted
                ? 'card.update.markComplete'
                : 'card.update.markIncomplete',
              content: message
            },
            session
          })
        }

        if ('dueAt' in data) {
          const oldDueAt = card.dueAt ? new Date(card.dueAt).getTime() : null
          const newDueAt = data.dueAt ? new Date(data.dueAt).getTime() : null

          if (oldDueAt !== newDueAt) {
            const hasDueAt = !!data.dueAt

            insertedLogs = await ActivityLogRepo.createOne({
              data: {
                boardId: boardAccess.board._id.toString(),
                authorId: boardAccess.boardMember._id.toString(),
                authorType: 'boardMember',
                entityType: 'card',
                entityId: card._id.toString(),
                action: hasDueAt ? 'card.update.dueAt' : 'card.remove.dueAt',
                content: hasDueAt
                  ? `set due date for card "${card.title}"`
                  : `removed due date from card "${card.title}"`
              },
              session
            })
          }
        }

        return updatedCard
      })

      emitCardUpdatedBasic({
        boardId: boardAccess.board._id,
        card: updatedCard
      })

      if (insertedLogs) {
        const log = await ActivityLogRepo.findOne({
          filter: { _id: insertedLogs.insertedId },
          options: { session }
        })

        return { card: updatedCard, log }
      }

      return { card: updatedCard, log: null }
    } finally {
      await session.endSession()
    }
  }

  static archive = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()

    try {
      return await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        await ColumnRepo.pullCardOrderIds({ card, session })

        const updatedCard = await CardRepo.updateOne({
          filter: { _id: new ObjectId(_id) },
          data: { $set: { status: 'archived', archivedAt: new Date() } },
          session
        })

        const createdLog = await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'card',
            entityId: updatedCard._id.toString(),
            action: 'card.archive',
            content: `archived card "${card.title}"`
          },
          session
        })

        const log = await ActivityLogRepo.findOne({
          filter: { _id: createdLog.insertedId },
          options: { session }
        })

        return { card: updatedCard, log }
      })
    } finally {
      await session.endSession()
    }
  }

  static restore = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()

    try {
      return await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString(),
            status: 'archived'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        await ColumnRepo.pushCardOrderIds({ card, session })

        const updatedCard = await CardRepo.updateOne({
          filter: { _id: new ObjectId(_id) },
          data: { $set: { status: 'active', archivedAt: null } },
          session
        })

        const createdLog = await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'card',
            entityId: updatedCard._id.toString(),
            action: 'card.restore',
            content: `restored card "${card.title}"`
          },
          session
        })

        const log = await ActivityLogRepo.findOne({
          filter: { _id: createdLog.insertedId },
          options: { session }
        })

        return { card: updatedCard, log }
      })
    } finally {
      await session.endSession()
    }
  }

  static joinCard = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()
    try {
      return await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        const boardMember = boardAccess.boardMember

        const isJoined = card.memberIds?.some(
          (memberId) => memberId.toString() === boardMember._id.toString()
        )

        if (isJoined)
          throw new ConflictErrorResponse('You have already joined this card.')

        const updatedCard = await CardRepo.updateMembers({
          _id,
          data: { action: 'ADD', boardMemberId: boardMember._id.toString() },
          session
        })

        const createdLog = await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'card',
            entityId: updatedCard._id.toString(),
            action: 'card.join',
            content: `joined card "${card.title}"`
          },
          session
        })

        const log = await ActivityLogRepo.findOne({
          filter: { _id: createdLog.insertedId },
          options: { session }
        })

        emitCardUpdatedBasic({
          boardId: card.boardId,
          card: updatedCard
        })

        return { card: updatedCard, log }
      })
    } finally {
      await session.endSession()
    }
  }

  static leaveCard = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()
    try {
      return await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        const boardMember = boardAccess.boardMember

        const isJoined = card.memberIds?.some(
          (memberId) => memberId.toString() === boardMember._id.toString()
        )

        if (!isJoined)
          throw new ConflictErrorResponse('You are not a member of this card.')

        const updatedCard = await CardRepo.updateMembers({
          _id,
          data: { action: 'REMOVE', boardMemberId: boardMember._id.toString() },
          session
        })

        const createdLog = await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'card',
            entityId: updatedCard._id.toString(),
            action: 'card.leave',
            content: `left card "${card.title}"`
          },
          session
        })

        const log = await ActivityLogRepo.findOne({
          filter: { _id: createdLog.insertedId },
          options: { session }
        })

        emitCardUpdatedBasic({
          boardId: card.boardId,
          card: updatedCard
        })

        return { card: updatedCard, log }
      })
    } finally {
      await session.endSession()
    }
  }

  static assignMemberToCard = async ({ _id, boardAccess, data }) => {
    const session = await mongoClientInstance.startSession()

    try {
      return await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        const currentBoardMember = boardAccess.boardMember
        const isSelfAssign =
          data.memberId.toString() === currentBoardMember._id.toString()

        let targetBoardMember = null

        if (isSelfAssign) {
          targetBoardMember = currentBoardMember
        } else {
          targetBoardMember = await BoardMemberRepo.findOne({
            filter: {
              _id: new ObjectId(data.memberId),
              boardId: card.boardId,
              status: 'active'
            },
            options: { session }
          })

          if (!targetBoardMember) {
            throw new BadRequestErrorResponse(
              'The selected member is not in this board.'
            )
          }
        }

        const isAssigned = card.memberIds?.some(
          (memberId) => memberId.toString() === targetBoardMember._id.toString()
        )

        if (isAssigned) {
          if (isSelfAssign) {
            throw new ConflictErrorResponse(
              'You have already joined this card.'
            )
          }

          throw new ConflictErrorResponse(
            'The selected member has already been added to this card.'
          )
        }

        const updatedCard = await CardRepo.updateMembers({
          _id,
          data: {
            action: 'ADD',
            boardMemberId: targetBoardMember._id.toString()
          },
          session
        })

        const createdLog = await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: currentBoardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'card',
            entityId: card._id.toString(),
            action: isSelfAssign ? 'card.join' : 'card.member.assign',
            content: isSelfAssign
              ? `joined card "${card.title}"`
              : `assigned a member to card "${card.title}"`
          },
          session
        })

        const log = await ActivityLogRepo.findOne({
          filter: { _id: createdLog.insertedId },
          options: { session }
        })

        emitCardUpdatedBasic({
          boardId: card.boardId,
          card: updatedCard
        })

        return { card: updatedCard, log }
      })
    } finally {
      await session.endSession()
    }
  }

  static removeMemberFromCard = async ({ _id, boardAccess, data }) => {
    const session = await mongoClientInstance.startSession()

    try {
      return await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        const currentBoardMember = boardAccess.boardMember
        const isSelfRemove =
          data.memberId.toString() === currentBoardMember._id.toString()

        let targetBoardMember = null

        if (isSelfRemove) {
          targetBoardMember = currentBoardMember
        } else {
          targetBoardMember = await BoardMemberRepo.findOne({
            filter: {
              _id: new ObjectId(data.memberId),
              boardId: card.boardId,
              status: 'active'
            },
            options: { session }
          })

          if (!targetBoardMember) {
            throw new BadRequestErrorResponse(
              'The selected member is not in this board.'
            )
          }
        }

        const isAssigned = card.memberIds?.some(
          (memberId) => memberId.toString() === targetBoardMember._id.toString()
        )

        if (!isAssigned) {
          if (isSelfRemove) {
            throw new ConflictErrorResponse(
              'You are not a member of this card.'
            )
          }

          throw new ConflictErrorResponse('This member is not in the card.')
        }

        const updatedCard = await CardRepo.updateMembers({
          _id,
          data: {
            action: 'REMOVE',
            boardMemberId: targetBoardMember._id.toString()
          },
          session
        })

        const createdLog = await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: currentBoardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'card',
            entityId: card._id.toString(),
            action: isSelfRemove ? 'card.leave' : 'card.member.remove',
            content: isSelfRemove
              ? `left card "${card.title}"`
              : `removed a member from card "${card.title}"`
          },
          session
        })

        const log = await ActivityLogRepo.findOne({
          filter: { _id: createdLog.insertedId },
          options: { session }
        })

        emitCardUpdatedBasic({
          boardId: card.boardId,
          card: updatedCard
        })

        return { card: updatedCard, log }
      })
    } finally {
      await session.endSession()
    }
  }

  static updateLabel = async ({ _id, userContext, data }) => {
    const card = await CardRepo.findOne({
      filter: { _id: new ObjectId(_id) }
    })
    if (!card) throw new NotFoundErrorResponse('Card not found.')

    const boardMember = await BoardMemberRepo.findMemberInBoard({
      userId: userContext._id,
      boardId: card.boardId
    })
    if (!boardMember)
      throw new ForbiddenErrorResponse('You are not a member of this board.')
    const labelId = data.labelId

    const label = await LabelRepo.findOne({
      filter: { _id: new ObjectId(labelId), boardId: card.boardId }
    })
    if (!label) throw new NotFoundErrorResponse('Label not found.')

    let updatedCard = null
    if (card.labelIds.includes(labelId)) {
      updatedCard = await CardRepo.updateOne({
        filter: { _id: new ObjectId(_id) },
        data: { $pull: { labelIds: labelId } }
      })
    } else {
      updatedCard = await CardRepo.updateOne({
        filter: { _id: new ObjectId(_id) },
        data: { $push: { labelIds: labelId } }
      })
    }

    emitCardUpdatedBasic({
      boardId: card.boardId,
      card: updatedCard
    })

    return updatedCard
  }

  static delete = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()
    let fileKeys = []

    try {
      const deletedCard = await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(_id),
            boardId: boardAccess.board._id,
            status: 'archived'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        const board = await BoardRepo.findOne({
          filter: { _id: new ObjectId(card.boardId) },
          options: { session }
        })

        if (!board) throw new NotFoundErrorResponse('Board not found.')

        const attachments = await AttachmentRepo.findMany({
          filter: { cardId: card._id.toString() },
          options: { session }
        })

        fileKeys = attachments?.map((item) => item.fileKey) ?? []

        const totalAttachmentSize = attachments.reduce(
          (sum, item) => sum + (item.fileSize || 0),
          0
        )

        await CommentRepo.deleteMany({
          filter: { cardId: card._id.toString() },
          session
        })

        await AttachmentRepo.deleteMany({
          filter: { cardId: card._id.toString() },
          session
        })

        await TaskRepo.deleteMany({
          filter: { cardId: card._id.toString() },
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

        await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'card',
            entityId: card._id.toString(),
            action: 'card.delete',
            content: `deleted card "${card.title}"`
          },
          session
        })

        return await CardRepo.deleteOne({
          filter: { _id: new ObjectId(card._id) },
          session
        })
      })

      if (fileKeys.length) {
        await S3Provider.deleteMany(fileKeys)
      }

      return deletedCard
    } finally {
      await session.endSession()
    }
  }
}

export default CardService
