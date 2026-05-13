import {
  CreatedSuccessResponse,
  OkSuccessResponse
} from '~/core/success.response'
import InvitationService from '~/services/invitation.service'

class InvitationController {
  static getInvitations = async (req, res) => {
    new OkSuccessResponse({
      metadata: await InvitationService.getInvitations({
        userContext: req.userContext
      })
    }).send(res)
  }

  static createWorkspaceInvitation = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await InvitationService.createWorkspaceInvitation({
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static createBoardInvitation = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await InvitationService.createBoardInvitation({
        boardAccess: req.boardAccess,
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static updateWorkspaceInvitation = async (req, res) => {
    new OkSuccessResponse({
      metadata: await InvitationService.updateWorkspaceInvitation({
        _id: req.params._id,
        data: req.body,
        userContext: req.userContext
      })
    }).send(res)
  }

  static updateBoardInvitation = async (req, res) => {
    new OkSuccessResponse({
      metadata: await InvitationService.updateBoardInvitation({
        _id: req.params._id,
        data: req.body,
        userContext: req.userContext
      })
    }).send(res)
  }
}
export default InvitationController
