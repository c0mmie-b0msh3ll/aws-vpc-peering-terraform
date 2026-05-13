import express from 'express'
import { columnValidation } from '~/validations/column.validation'
import { authMiddleware } from '~/middlewares/auth.middleware'
import ColumnController from '~/controllers/column.controller'
import asyncHandler from '~/helpers/asyncHandler'
import validate from '~/utils/validate'
import { boardMiddleware } from '~/middlewares/boardPermission.middleware'
import { BOARD_PERMISSIONS } from '~/constant/boardPermission.constant'
import { createIdParamSchema } from '~/validations/common.validation'

const Router = express.Router()
Router.use(asyncHandler(authMiddleware.isAuthorized))

//done
Router.route('/').post(
  asyncHandler(validate(columnValidation.create)),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.COLUMN_CREATE)
  ),
  asyncHandler(ColumnController.create)
)

Router.route('/archived/:boardId').get(
  asyncHandler(validate(createIdParamSchema('boardId'), 'params')),
  asyncHandler(boardMiddleware.checkPermission(null)),
  asyncHandler(ColumnController.fetchArchived)
)

Router.route('/archive/:boardId/:columnId').put(
  asyncHandler(
    validate(columnValidation.updateAndDeleteColumnParamSchema, 'params')
  ),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.COLUMN_ARCHIVE)
  ),
  asyncHandler(ColumnController.archive)
)

Router.route('/restore/:boardId/:columnId').put(
  asyncHandler(
    validate(columnValidation.updateAndDeleteColumnParamSchema, 'params')
  ),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.COLUMN_RESTORE)
  ),
  asyncHandler(ColumnController.restore)
)

Router.route('/:boardId/:columnId')
  .put(
    asyncHandler(
      validate(columnValidation.updateAndDeleteColumnParamSchema, 'params')
    ),
    asyncHandler(
      boardMiddleware.checkPermission(BOARD_PERMISSIONS.COLUMN_UPDATE)
    ),
    asyncHandler(validate(columnValidation.update)),
    asyncHandler(ColumnController.update)
  )
  .delete(
    asyncHandler(
      validate(columnValidation.updateAndDeleteColumnParamSchema, 'params')
    ),
    asyncHandler(
      boardMiddleware.checkPermission(BOARD_PERMISSIONS.COLUMN_DELETE)
    ),
    asyncHandler(ColumnController.delete)
  )

export const columnRoute = Router
