import express from 'express'
import { cardValidation } from '~/validations/card.validation'
import { authMiddleware } from '~/middlewares/auth.middleware'
import asyncHandler from '~/helpers/asyncHandler'
import CardController from '~/controllers/card.controller'
import validate from '~/utils/validate'
import { boardMiddleware } from '~/middlewares/boardPermission.middleware'
import { BOARD_PERMISSIONS } from '~/constant/boardPermission.constant'
import { createIdParamSchema } from '~/validations/common.validation'
import AIController from '~/controllers/ai.controller'

const Router = express.Router()
Router.use(asyncHandler(authMiddleware.isAuthorized))

Router.route('/archived/:boardId').get(
  asyncHandler(validate(createIdParamSchema('boardId'), 'params')),
  asyncHandler(boardMiddleware.checkPermission(null)),
  asyncHandler(CardController.fetchArchived)
)

// done
Router.route('/').post(
  asyncHandler(validate(cardValidation.create)),
  asyncHandler(boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_CREATE)),
  asyncHandler(CardController.create)
)

// done
Router.route('/archive/:boardId/:cardId').put(
  asyncHandler(
    validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
  ),
  asyncHandler(boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_ARCHIVE)),
  asyncHandler(CardController.archive)
)

// done
Router.route('/restore/:boardId/:cardId').put(
  asyncHandler(
    validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
  ),
  asyncHandler(boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_RESTORE)),
  asyncHandler(CardController.restore)
)

// done
Router.route('/join/:boardId/:cardId').put(
  asyncHandler(
    validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
  ),
  asyncHandler(boardMiddleware.checkPermission(null)),
  asyncHandler(CardController.joinCard)
)

// done
Router.route('/leave/:boardId/:cardId').put(
  asyncHandler(
    validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
  ),
  asyncHandler(boardMiddleware.checkPermission(null)),
  asyncHandler(CardController.leaveCard)
)

// done
Router.route('/assign-member/:boardId/:cardId').put(
  asyncHandler(
    validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
  ),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_MEMBER_ASSIGN)
  ),
  asyncHandler(CardController.assignMemberToCard)
)

// done
Router.route('/remove-member/:boardId/:cardId').put(
  asyncHandler(
    validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
  ),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_MEMBER_REMOVE)
  ),
  asyncHandler(CardController.removeMemberFromCard)
)

Router.route('/labels/:boardId/:cardId').put(
  asyncHandler(
    validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
  ),
  asyncHandler(boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_UPDATE)),
  asyncHandler(CardController.updateLabel)
)

Router.route('/:boardId/:cardId')
  .put(
    asyncHandler(
      validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
    ),
    asyncHandler(
      boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_UPDATE)
    ),
    asyncHandler(CardController.updateBasic)
  )
  // done
  .delete(
    asyncHandler(
      validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
    ),
    asyncHandler(
      boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_DELETE)
    ),
    asyncHandler(CardController.delete)
  )

Router.route('/ai-assist/:boardId/:cardId').post(
  asyncHandler(
    validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
  ),
  asyncHandler(boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_UPDATE)),
  asyncHandler(AIController.generateCardAssist)
)

Router.route('/ai-assist/:boardId/:cardId/apply').post(
  asyncHandler(
    validate(cardValidation.updateAndDeleteCardParamSchema, 'params')
  ),
  asyncHandler(boardMiddleware.checkPermission(BOARD_PERMISSIONS.CARD_UPDATE)),
  asyncHandler(AIController.applyCardAssist)
)

Router.route('/:_id').get(asyncHandler(CardController.fetchDetail))

export const cardRoute = Router
