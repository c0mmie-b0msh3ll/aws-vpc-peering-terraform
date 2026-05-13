import express from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import asyncHandler from '~/helpers/asyncHandler'
import AttachmentController from '~/controllers/attachment.controller'
import { multerUploadMiddleware } from '~/middlewares/multerUpload.middleware'
import { boardMiddleware } from '~/middlewares/boardPermission.middleware'
import { BOARD_PERMISSIONS } from '~/constant/boardPermission.constant'
import validate from '~/utils/validate'
import { attachmentValidation } from '~/validations/attachment.validation'

const Router = express.Router()
Router.use(asyncHandler(authMiddleware.isAuthorized))

Router.route('/presign-url/:boardId/:attachmentId').get(
  asyncHandler(
    validate(
      attachmentValidation.updateAndDeleteAttachmentParamSchema,
      'params'
    )
  ),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_ATTACHMENT_DOWNLOAD)
  ),
  asyncHandler(AttachmentController.download)
)

Router.route('/').post(
  asyncHandler(multerUploadMiddleware.uploadMultipleFiles),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_ATTACHMENT_CREATE)
  ),
  asyncHandler(AttachmentController.upload)
)

Router.route('/:boardId/:attachmentId').put(
  asyncHandler(
    validate(
      attachmentValidation.updateAndDeleteAttachmentParamSchema,
      'params'
    )
  ),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_ATTACHMENT_CREATE)
  ),
  asyncHandler(AttachmentController.update)
)

Router.route('/:boardId/:attachmentId').delete(
  asyncHandler(
    validate(
      attachmentValidation.updateAndDeleteAttachmentParamSchema,
      'params'
    )
  ),
  asyncHandler(boardMiddleware.checkPermission(null)),
  asyncHandler(AttachmentController.delete)
)

export const attachmentRouter = Router
