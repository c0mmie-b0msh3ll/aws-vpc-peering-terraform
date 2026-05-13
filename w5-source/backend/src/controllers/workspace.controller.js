import {
  CreatedSuccessResponse,
  OkSuccessResponse
} from '~/core/success.response'
import WorkspaceService from '~/services/workspace.service'

class WorkspaceController {
  static create = async (req, res) => {
    new OkSuccessResponse({
      metadata: await WorkspaceService.create({
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static update = async (req, res) => {
    new OkSuccessResponse({
      metadata: await WorkspaceService.update({
        _id: req.params.workspaceId,
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static delete = async (req, res) => {
    new OkSuccessResponse({
      metadata: await WorkspaceService.delete({
        _id: req.params.workspaceId,
        userContext: req.userContext
      })
    }).send(res)
  }

  static fetchByUser = async (req, res) => {
    new OkSuccessResponse({
      metadata: await WorkspaceService.fetchByUser({
        userContext: req.userContext
      })
    }).send(res)
  }

  static fetchWorkspaceInfo = async (req, res) => {
    new OkSuccessResponse({
      metadata: await WorkspaceService.fetchWorkspaceInfo({
        _id: req.params.workspaceId,
        userContext: req.userContext
      })
    }).send(res)
  }

  static fetchWorkspaceMember = async (req, res) => {
    new OkSuccessResponse({
      metadata: await WorkspaceService.fetchWorkspaceMember({
        _id: req.params.workspaceId,
        data: req.query,
        userContext: req.userContext
      })
    }).send(res)
  }

  static fetchWorkspaceRole = async (req, res) => {
    new OkSuccessResponse({
      metadata: await WorkspaceService.fetchWorkspaceRole({
        _id: req.params.workspaceId,
        userContext: req.userContext
      })
    }).send(res)
  }

  static fetchWorkspacePermission = async (req, res) => {
    new OkSuccessResponse({
      metadata: await WorkspaceService.fetchWorkspacePermission()
    }).send(res)
  }

  static createExport = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await WorkspaceService.createExport({
        workspaceAccess: req.workspaceAccess,
        userContext: req.userContext
      })
    }).send(res)
  }

  static downloadExport = async (req, res) => {
    const exportFile = await WorkspaceService.getExport({
      workspaceAccess: req.workspaceAccess,
      exportId: req.params.exportId
    })

    return res.download(exportFile.filePath, exportFile.fileName)
  }

  static createRole = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await WorkspaceService.createRole({
        workspaceAccess: req.workspaceAccess,
        data: req.body
      })
    }).send(res)
  }

  static updateRole = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await WorkspaceService.updateRole({
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static deleteRole = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await WorkspaceService.deleteRole({
        _id: req.params.roleId,
        userContext: req.userContext
      })
    }).send(res)
  }

  static updateMemberRole = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await WorkspaceService.updateMemberRole({
        _id: req.params.memberId,
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static leaveWorkspace = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await WorkspaceService.leaveWorkspace({
        _id: req.params.memberId,
        userContext: req.userContext
      })
    }).send(res)
  }

  static removeMember = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await WorkspaceService.removeMember({
        _id: req.params.memberId,
        userContext: req.userContext
      })
    }).send(res)
  }
}
export default WorkspaceController
