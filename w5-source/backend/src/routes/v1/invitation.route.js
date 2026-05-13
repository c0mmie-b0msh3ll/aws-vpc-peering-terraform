import express from 'express'
import { invitationValidation } from '~/validations/invitationValidation'
import { authMiddleware } from '~/middlewares/auth.middleware'
import InvitationController from '~/controllers/invitation.controller'
import asyncHandler from '~/helpers/asyncHandler'
import { workspaceMiddleware } from '~/middlewares/workspacePermission.middleware'
import { WORKSPACE_PERMISSIONS } from '~/constant/workspacePermission.constant'
import { boardMiddleware } from '~/middlewares/boardPermission.middleware'
import { BOARD_PERMISSIONS } from '~/constant/boardPermission.constant'

const Router = express.Router()

Router.route('/workspace').post(
  asyncHandler(authMiddleware.isAuthorized),
  // asyncHandler(validate(invitationValidation.createNewBoardInvitation)),
  asyncHandler(
    workspaceMiddleware.checkPermission(WORKSPACE_PERMISSIONS.MEMBER_INVITE)
  ),
  asyncHandler(InvitationController.createWorkspaceInvitation)
)

Router.route('/board').post(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(
    boardMiddleware.checkPermission(BOARD_PERMISSIONS.MEMBER_INVITE)
  ),
  // asyncHandler(validate(invitationValidation.createNewBoardInvitation)),
  asyncHandler(InvitationController.createBoardInvitation)
)

Router.route('/').get(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(InvitationController.getInvitations)
)

Router.route('/workspace/:_id').put(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(InvitationController.updateWorkspaceInvitation)
)

Router.route('/board/:_id').put(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(InvitationController.updateBoardInvitation)
)

export const invitationRoute = Router
