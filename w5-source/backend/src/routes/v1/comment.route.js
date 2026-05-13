import express from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import asyncHandler from '~/helpers/asyncHandler'
import CommentController from '~/controllers/comment.controller'
import { createIdParamSchema } from '~/validations/common.validation'
import validate from '~/utils/validate'
import { boardMiddleware } from '~/middlewares/boardPermission.middleware'
import { BOARD_PERMISSIONS } from '~/constant/boardPermission.constant'
import { commentValidation } from '~/validations/comment.validation'

const Router = express.Router()

Router.use(asyncHandler(authMiddleware.isAuthorized))

Router.route('/:boardId').post(
  asyncHandler(validate(createIdParamSchema('boardId'), 'params')),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_COMMENT_CREATE)
  ),
  asyncHandler(CommentController.create)
)

Router.route('/:boardId/:commentId').delete(
  asyncHandler(validate(commentValidation.deleteCommentParamSchema, 'params')),
  asyncHandler(boardMiddleware.checkPermission(null)),
  asyncHandler(CommentController.delete)
)

export const commentRoute = Router
