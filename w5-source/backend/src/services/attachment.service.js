import { ObjectId } from 'mongodb'
import {
  BadRequestErrorResponse,
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import S3Provider from '~/providers/S3Provider'
import BoardMemberRepo from '~/repo/boardMember.repo'
import CardRepo from '~/repo/card.repo'
import WorkspaceRepo from '~/repo/workspace.repo'
import BoardRepo from '~/repo/board.repo'
import { mongoClientInstance } from '~/config/mongodb'
import AttachmentRepo from '~/repo/attachment.repo'
import ActivityLogRepo from '~/repo/activityLog.repo'
import { BOARD_PERMISSIONS } from '~/constant/boardPermission.constant'
import { getActiveSubscriptionCached } from '~/helpers/subscription.cache'
import { emitCardUpdatedBasic } from '~/realtime/realtimeEmitters/cardRealtime.emitter'
import {
  emitAttachmentCreated,
  emitAttachmentDeleted,
  emitAttachmentUpdated
} from '~/realtime/realtimeEmitters/attachmentRealtime.emitter'

class AttachmentService {
  static upload = async ({ boardAccess, cardId, files }) => {
    const card = await CardRepo.findOne({
      filter: {
        _id: new ObjectId(cardId),
        boardId: boardAccess.board._id.toString(),
        status: 'active'
      }
    })

    if (!card) throw new NotFoundErrorResponse('Card not found.')

    const board = await BoardRepo.findOne({
      filter: { _id: new ObjectId(card.boardId), status: 'active' }
    })

    if (!board) throw new NotFoundErrorResponse('Board not found.')

    const subscription = await getActiveSubscriptionCached({
      workspaceId: boardAccess.board.workspaceId.toString()
    })

    if (!subscription)
      throw new NotFoundErrorResponse(
        'Subscription not found for this workspace.'
      )

    const limits =
      subscription?.limits || subscription?.planFeatureSnapshot?.limits || {}

    const {
      maxStorageMb = 0,
      maxFileSizeMb = 0,
      maxFilesPerUpload = 0
    } = limits

    const workspace = await WorkspaceRepo.findOne({
      filter: { _id: new ObjectId(boardAccess.board.workspaceId) }
    })

    if (!workspace) throw new NotFoundErrorResponse('Workspace not found.')

    if (!files?.length)
      throw new BadRequestErrorResponse('File list is required.')

    if (maxFilesPerUpload > 0 && files.length > maxFilesPerUpload)
      throw new BadRequestErrorResponse(
        `You can upload up to ${maxFilesPerUpload} files at a time.`
      )

    const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024
    const maxStorageBytes = maxStorageMb * 1024 * 1024

    const exceededFile = files.find((file) => file.size > maxFileSizeBytes)
    if (maxFileSizeMb > 0 && exceededFile)
      throw new BadRequestErrorResponse(
        `File "${exceededFile.originalname}" exceeds the ${maxFileSizeMb} MB limit.`
      )

    const uploadSize = files.reduce((sum, file) => sum + file.size, 0)
    const currentStorageUsed = workspace.storageUsed || 0

    if (maxStorageMb > 0 && currentStorageUsed + uploadSize > maxStorageBytes)
      throw new BadRequestErrorResponse(
        `Workspace storage limit exceeded. Maximum allowed is ${maxStorageMb} MB.`
      )

    let uploaded = []

    const session = await mongoClientInstance.startSession()
    try {
      session.startTransaction()

      uploaded = await S3Provider.uploadMany(files)

      const attachments = uploaded.map((file) => ({
        cardId: card._id.toString(),
        boardId: card.boardId.toString(),
        fileName: file.fileName,
        fileKey: file.fileKey,
        fileType: file.fileType,
        fileSize: file.fileSize,
        uploadedBy: boardAccess.boardMember._id.toString()
      }))

      const sumSize = attachments.reduce((acc, file) => acc + file.fileSize, 0)

      const createdAttachment = await AttachmentRepo.createMany({
        data: attachments,
        session
      })

      const insertedIds = Object.values(createdAttachment.insertedIds || {})

      const newAttachment = await AttachmentRepo.findMany({
        filter: { _id: { $in: insertedIds } },
        options: { session }
      })

      await WorkspaceRepo.updateOne({
        filter: { _id: new ObjectId(board.workspaceId) },
        data: {
          $inc: { storageUsed: sumSize },
          $set: { updatedAt: new Date() }
        },
        session
      })

      const updatedCard = await CardRepo.updateOne({
        filter: { _id: new ObjectId(cardId) },
        data: {
          $inc: { attachmentCount: attachments.length },
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
          action: 'card.attachment.create',
          content:
            attachments.length === 1
              ? `attached "${attachments[0].fileName}" to card "${card.title}"`
              : `attached ${attachments.length} files to card "${card.title}"`
        },
        session
      })

      const log = await ActivityLogRepo.findOne({
        filter: { _id: createdLog.insertedId },
        options: { session }
      })

      await session.commitTransaction()

      const attachmentsWithUrl = newAttachment?.map((a) => ({
        ...a,
        url: S3Provider.getUrl(a.fileKey)
      }))

      emitAttachmentCreated({
        boardId: board._id.toString(),
        card: updatedCard,
        attachments: attachmentsWithUrl,
        log
      })

      emitCardUpdatedBasic({
        boardId: boardAccess.board._id,
        card: updatedCard
      })

      return { cardDetail: updatedCard, attachments: attachmentsWithUrl, log }
    } catch (err) {
      await session.abortTransaction()
      const keys = uploaded?.map((f) => f.fileKey) ?? []
      if (keys.length) await S3Provider.deleteMany(keys)
      throw err
    } finally {
      await session.endSession()
    }
  }

  static update = async ({ _id, userContext, data }) => {
    const attachment = await AttachmentRepo.findOne({
      filter: { _id: new ObjectId(_id) }
    })
    if (!attachment) throw new NotFoundErrorResponse('Attachment not found.')

    const boardMember = await BoardMemberRepo.findMemberInBoard({
      userId: userContext._id,
      boardId: attachment.boardId
    })

    if (!boardMember)
      throw new ForbiddenErrorResponse('You are not a member of this board.')

    const updatedAttachment = await AttachmentRepo.updateOne({
      filter: { _id: new ObjectId(_id) },
      data: { $set: { fileName: data?.fileName } }
    })

    emitAttachmentUpdated({
      boardId: attachment.boardId,
      card: attachment.cardId,
      attachment: updatedAttachment
    })

    return {
      ...updatedAttachment,
      url: S3Provider.getUrl(updatedAttachment.fileKey)
    }
  }

  static download = async ({ _id, userContext }) => {
    const attachment = await AttachmentRepo.findOne({
      filter: { _id: new ObjectId(_id) }
    })
    if (!attachment) throw new NotFoundErrorResponse('Attachment not found.')

    const boardMember = await BoardMemberRepo.findMemberInBoard({
      userId: userContext._id,
      boardId: attachment.boardId
    })

    if (!boardMember)
      throw new ForbiddenErrorResponse('You are not a member of this board.')

    const downloadUrl = await S3Provider.getSignedDownloadUrl({
      key: attachment.fileKey,
      fileName: attachment.fileName
    })

    return downloadUrl
  }

  static delete = async ({ _id, boardAccess }) => {
    const attachment = await AttachmentRepo.findOne({
      filter: { _id: new ObjectId(_id) }
    })

    if (!attachment) {
      throw new NotFoundErrorResponse('Attachment not found.')
    }

    const board = await BoardRepo.findOne({
      filter: {
        _id: new ObjectId(attachment.boardId),
        status: 'active'
      }
    })

    if (!board || board._id.toString() !== boardAccess.board._id.toString()) {
      throw new NotFoundErrorResponse('Attachment not found.')
    }

    const card = await CardRepo.findOne({
      filter: {
        _id: new ObjectId(attachment.cardId),
        boardId: boardAccess.board._id.toString()
      }
    })

    if (!card) {
      throw new NotFoundErrorResponse('Card not found.')
    }

    const boardMember = boardAccess.boardMember
    const isOwner =
      attachment.uploadedBy.toString() === boardMember._id.toString()

    if (!isOwner) {
      const permissionCodes = boardAccess.permissionCodes || []

      if (!permissionCodes.includes(BOARD_PERMISSIONS.CARD_ATTACHMENT_DELETE)) {
        throw new ForbiddenErrorResponse(
          'You are not allowed to delete this attachment.'
        )
      }
    }

    let updatedCard = null
    let log = null
    const session = await mongoClientInstance.startSession()

    try {
      await session.withTransaction(async () => {
        await AttachmentRepo.deleteOne({
          filter: { _id: new ObjectId(_id) },
          session
        })

        await WorkspaceRepo.updateOne({
          filter: { _id: new ObjectId(board.workspaceId) },
          data: {
            $inc: { storageUsed: -attachment.fileSize },
            $set: { updatedAt: new Date() }
          },
          session
        })

        updatedCard = await CardRepo.updateOne({
          filter: { _id: new ObjectId(attachment.cardId) },
          data: {
            $inc: { attachmentCount: -1 },
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
            action: 'card.attachment.delete',
            content: isOwner
              ? `deleted their attachment from card "${card.title}"`
              : `deleted another member's attachment from card "${card.title}"`
          },
          session
        })

        log = await ActivityLogRepo.findOne({
          filter: { _id: createdLog.insertedId },
          options: { session }
        })

        emitCardUpdatedBasic({
          boardId: boardAccess.board._id,
          card: updatedCard
        })

        emitAttachmentDeleted({
          boardId: board._id.toString(),
          card: updatedCard,
          attachment: { _id },
          log
        })

        return {}
      })
    } finally {
      await session.endSession()
    }

    await S3Provider.delete(attachment.fileKey)

    return { _id, cardDetail: updatedCard, log }
  }
}

export default AttachmentService
