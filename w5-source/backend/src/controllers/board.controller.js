import {
  CreatedSuccessResponse,
  OkSuccessResponse
} from '~/core/success.response'
import BoardService from '~/services/board.service'

class BoardController {
  static fetchBoardByWorkspaceId = async (req, res) => {
    new OkSuccessResponse({
      metadata: await BoardService.fetchBoardByWorkspaceId({
        workspaceId: req.params.workspaceId,
        userContext: req.userContext
      })
    }).send(res)
  }

  static getBackground = async (req, res) => {
    new OkSuccessResponse({
      metadata: await BoardService.getBackground({
        userContext: req.userContext,
      })
    }).send(res)
  }

  static getBoards = async (req, res) => {
    new OkSuccessResponse({
      metadata: await BoardService.getBoards({
        userContext: req.userContext,
        data: req.query
      })
    }).send(res)
  }

  static getBoardOverview = async (req, res) => {
    new OkSuccessResponse({
      metadata: await BoardService.getBoardOverview({
        userContext: req.userContext,
        data: req.query
      })
    }).send(res)
  }

  static getDetails = async (req, res) => {
    new OkSuccessResponse({
      metadata: await BoardService.getDetails({
        _id: req.params.boardId
      })
    }).send(res)
  }

  static create = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await BoardService.create({
        workspaceAccess: req.workspaceAccess,
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static update = async (req, res) => {
    new OkSuccessResponse({
      message: 'Update board successfully.',
      metadata: await BoardService.update({
        _id: req.params.boardId,
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static moveCardToDifferentColumn = async (req, res) => {
    new OkSuccessResponse({
      metadata: await BoardService.moveCardToDifferentColumn({ data: req.body })
    }).send(res)
  }

  static fetchBoardMember = async (req, res) => {
    new OkSuccessResponse({
      metadata: await BoardService.fetchBoardMember({
        _id: req.params.boardId,
        data: req.query
      })
    }).send(res)
  }

  static fetchBoardActivity = async (req, res) => {
    new OkSuccessResponse({
      metadata: await BoardService.fetchBoardActivity({
        _id: req.params.boardId
      })
    }).send(res)
  }

  static updateMemberRole = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await BoardService.updateMemberRole({
        _id: req.params.memberId,
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static fetchBoardPermission = async (req, res) => {
    new OkSuccessResponse({
      metadata: await BoardService.fetchBoardPermission()
    }).send(res)
  }

  static fetchBoardRole = async (req, res) => {
    new OkSuccessResponse({
      metadata: await BoardService.fetchBoardRole({
        _id: req.params._id,
        userContext: req.userContext
      })
    }).send(res)
  }

  // ============================== ROLE ==============================
  static createRole = async (req, res) => {
    new CreatedSuccessResponse({
      message: 'Create role successfully.',
      metadata: await BoardService.createRole({
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static updateRole = async (req, res) => {
    new CreatedSuccessResponse({
      message: 'Update role successfully.',
      metadata: await BoardService.updateRole({
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static deleteRole = async (req, res) => {
    new CreatedSuccessResponse({
      message: 'Delete role successfully',
      metadata: await BoardService.deleteRole({
        _id: req.params.roleId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }

  static updateStatus = async (req, res) => {
    new OkSuccessResponse({
      message: 'Delete board successfully',
      metadata: await BoardService.updateStatus({
        _id: req.params._id,
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static removeMember = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await BoardService.removeMember({
        _id: req.params.memberId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }

  static leaveBoard = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await BoardService.leaveBoard({
        _id: req.params.memberId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }
}
export default BoardController
