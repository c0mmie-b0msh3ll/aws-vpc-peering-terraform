import { ObjectId } from 'mongodb'
import { mongoClientInstance } from '~/config/mongodb'
import { BOARD_PERMISSIONS } from '~/constant/boardPermission.constant'
import {
  BadRequestErrorResponse,
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import { getActiveSubscriptionCached } from '~/helpers/subscription.cache'
import { emitCardUpdatedBasic } from '~/realtime/realtimeEmitters/cardRealtime.emitter'
import {
  emitCommentCreated,
  emitCommentDeleted
} from '~/realtime/realtimeEmitters/commentRealtime.emitter'
import ActivityLogRepo from '~/repo/activityLog.repo'
import CardRepo from '~/repo/card.repo'
import CommentRepo from '~/repo/comment.repo'

class CommentService {
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
      const result = await session.withTransaction(async () => {
        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(data.cardId),
            boardId: boardAccess.board._id,
            status: 'active'
          },
          options: { session }
        })

        if (!card) throw new NotFoundErrorResponse('Card not found.')

        const content = data.content?.trim()

        if (!content)
          throw new BadRequestErrorResponse('Comment content is required.')

        if (card.commentCount >= features?.limits?.maxCommentsPerCard)
          throw new ForbiddenErrorResponse(
            'This card has reached its comment limit.'
          )

        const createdComment = await CommentRepo.createOne({
          data: {
            cardId: card._id.toString(),
            boardMemberId: boardAccess.boardMember._id.toString(),
            content
          },
          session
        })

        const updatedCard = await CardRepo.updateOne({
          filter: { _id: new ObjectId(data.cardId) },
          data: {
            $inc: { commentCount: 1 },
            $set: { updatedAt: new Date() }
          },
          session
        })

        const createdLog = await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'card',
            entityId: card._id.toString(),
            action: 'card.comment.create',
            content: `added a comment to card "${card.title}"`
          },
          session
        })

        return { comment: createdComment, card: updatedCard, log: createdLog }
      })

      const commentDetail = await CommentRepo.getDetail({
        _id: result.comment.insertedId
      })

      const log = await ActivityLogRepo.findOne({
        filter: { _id: new ObjectId(result.log.insertedId) }
      })

      emitCommentCreated({
        boardId: boardAccess.board._id,
        card: result.card,
        comment: commentDetail,
        log
      })

      emitCardUpdatedBasic({
        boardId: boardAccess.board._id,
        card: result.card
      })

      return { comment: commentDetail, card: result.card, log }
    } finally {
      await session.endSession()
    }
  }

  static delete = async ({ _id, boardAccess }) => {
    const session = await mongoClientInstance.startSession()

    try {
      return await session.withTransaction(async () => {
        const comment = await CommentRepo.findOne({
          filter: { _id: new ObjectId(_id) },
          options: { session }
        })

        if (!comment) {
          throw new NotFoundErrorResponse('Comment not found.')
        }

        const card = await CardRepo.findOne({
          filter: {
            _id: new ObjectId(comment.cardId),
            boardId: boardAccess.board._id.toString(),
            status: 'active'
          },
          options: { session }
        })

        if (!card) {
          throw new NotFoundErrorResponse('Comment not found.')
        }

        const boardMember = boardAccess.boardMember
        const isOwner =
          comment.boardMemberId.toString() === boardMember._id.toString()

        if (!isOwner) {
          const permissionCodes = boardAccess.permissionCodes || []

          if (
            !permissionCodes.includes(BOARD_PERMISSIONS.CARD_COMMENT_DELETE)
          ) {
            throw new ForbiddenErrorResponse(
              'You are not allowed to delete this comment.'
            )
          }
        }

        const updatedCard = await CardRepo.updateOne({
          filter: { _id: new ObjectId(comment.cardId) },
          data: {
            $inc: { commentCount: -1 },
            $set: { updatedAt: new Date() }
          },
          session
        })

        await CommentRepo.deleteOne({
          filter: { _id: new ObjectId(_id) },
          session
        })

        const createdLog = await ActivityLogRepo.createOne({
          data: {
            boardId: boardAccess.board._id.toString(),
            authorId: boardAccess.boardMember._id.toString(),
            authorType: 'boardMember',
            entityType: 'card',
            entityId: card._id.toString(),
            action: 'card.comment.delete',
            content: isOwner
              ? `deleted their comment from card "${card.title}"`
              : `deleted another member's comment from card "${card.title}"`
          },
          session
        })

        const log = await ActivityLogRepo.findOne({
          filter: { _id: new ObjectId(createdLog.insertedId) },
          options: { session }
        })

        emitCardUpdatedBasic({
          boardId: boardAccess.board._id,
          card: updatedCard
        })

        emitCommentDeleted({
          boardId: boardAccess.board._id,
          card: updatedCard,
          comment: { _id },
          log
        })

        return {
          comment: { _id },
          card: updatedCard,
          log
        }
      })
    } finally {
      await session.endSession()
    }
  }
}

export default CommentService
