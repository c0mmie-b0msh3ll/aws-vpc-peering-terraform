import express from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import asyncHandler from '~/helpers/asyncHandler'
import TaskController from '~/controllers/task.controller'
import validate from '~/utils/validate'
import { createIdParamSchema } from '~/validations/common.validation'
import { boardMiddleware } from '~/middlewares/boardPermission.middleware'
import { BOARD_PERMISSIONS } from '~/constant/boardPermission.constant'
import { taskValidation } from '~/validations/task.validation'
const Router = express.Router()

Router.use(asyncHandler(authMiddleware.isAuthorized))

Router.route('/:boardId').post(
  asyncHandler(validate(createIdParamSchema('boardId'), 'params')),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_TASK_CREATE)
  ),
  asyncHandler(TaskController.create)
)

Router.route('/:boardId/:taskId').put(
  asyncHandler(
    validate(taskValidation.updateAndDeleteTaskParamSchema, 'params')
  ),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_TASK_UPDATE)
  ),
  asyncHandler(TaskController.update)
)

Router.route('/:boardId/:taskId').delete(
  asyncHandler(
    validate(taskValidation.updateAndDeleteTaskParamSchema, 'params')
  ),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_TASK_DELETE)
  ),
  asyncHandler(TaskController.delete)
)

export const taskRouter = Router
