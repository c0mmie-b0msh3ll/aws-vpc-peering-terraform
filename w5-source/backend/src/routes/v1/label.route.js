import express from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import asyncHandler from '~/helpers/asyncHandler'
import LabelController from '~/controllers/label.controller'
import { BOARD_PERMISSIONS } from '~/constant/boardPermission.constant'
import { boardMiddleware } from '~/middlewares/boardPermission.middleware'
import { labelValidation } from '~/validations/label.validation'
import validate from '~/utils/validate'

const Router = express.Router()
Router.use(asyncHandler(authMiddleware.isAuthorized))

Router.route('/').post(
  asyncHandler(boardMiddleware.checkPermission(BOARD_PERMISSIONS.LABEL_CREATE)),
  asyncHandler(LabelController.create)
)

Router.route('/:boardId/:labelId').put(
  asyncHandler(
    validate(labelValidation.updateAndDeleteLabelParamSchema, 'params')
  ),
  asyncHandler(boardMiddleware.checkPermission(BOARD_PERMISSIONS.LABEL_UPDATE)),
  asyncHandler(LabelController.update)
)

Router.route('/:boardId/:labelId').delete(
  asyncHandler(
    validate(labelValidation.updateAndDeleteLabelParamSchema, 'params')
  ),
  asyncHandler(boardMiddleware.checkPermission(BOARD_PERMISSIONS.LABEL_DELETE)),
  asyncHandler(LabelController.delete)
)

export const labelRouter = Router
