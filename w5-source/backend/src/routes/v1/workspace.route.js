import express from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import asyncHandler from '~/helpers/asyncHandler'
import WorkspaceController from '~/controllers/workspace.controller'
import { workspaceMiddleware } from '~/middlewares/workspacePermission.middleware'
import { WORKSPACE_PERMISSIONS } from '~/constant/workspacePermission.constant'
import validate from '~/utils/validate'
import {
  createIdParamSchema,
  createWorkspaceExportParamSchema
} from '~/validations/common.validation'
import { workspaceMemberValidation } from '~/validations/workspaceMember.validation'

const Router = express.Router()

Router.route('/')
  .get(
    asyncHandler(authMiddleware.isAuthorized),
    asyncHandler(WorkspaceController.fetchByUser)
  )
  .post(
    asyncHandler(authMiddleware.isAuthorized),
    asyncHandler(WorkspaceController.create)
  )

Router.route('/permissions').get(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(WorkspaceController.fetchWorkspacePermission)
)

Router.route('/roles/:workspaceId').get(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(validate(createIdParamSchema('workspaceId'), 'params')),
  asyncHandler(WorkspaceController.fetchWorkspaceRole)
)

Router.route('/members/:workspaceId').get(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(validate(createIdParamSchema('workspaceId'), 'params')),
  asyncHandler(WorkspaceController.fetchWorkspaceMember)
)

Router.route('/members/leave/:memberId').delete(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(WorkspaceController.leaveWorkspace)
)

Router.route('/members/:workspaceId/:memberId')
  .put(
    asyncHandler(authMiddleware.isAuthorized),
    asyncHandler(
      validate(
        workspaceMemberValidation.updateAndDeleteWorkspaceMemberParamSchema,
        'params'
      )
    ),
    asyncHandler(
      workspaceMiddleware.checkPermission(
        WORKSPACE_PERMISSIONS.MEMBER_CHANGE_ROLE
      )
    ),
    asyncHandler(WorkspaceController.updateMemberRole)
  )
  .delete(
    asyncHandler(authMiddleware.isAuthorized),
    asyncHandler(
      validate(
        workspaceMemberValidation.updateAndDeleteWorkspaceMemberParamSchema,
        'params'
      )
    ),
    asyncHandler(
      workspaceMiddleware.checkPermission(WORKSPACE_PERMISSIONS.MEMBER_REMOVE)
    ),
    asyncHandler(WorkspaceController.removeMember)
  )

Router.route('/:workspaceId/exports')
  .post(
    asyncHandler(authMiddleware.isAuthorized),
    asyncHandler(validate(createIdParamSchema('workspaceId'), 'params')),
    asyncHandler(
      workspaceMiddleware.checkPermission(WORKSPACE_PERMISSIONS.VIEW)
    ),
    asyncHandler(WorkspaceController.createExport)
  )

Router.route('/:workspaceId/exports/:exportId/download').get(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(validate(createWorkspaceExportParamSchema, 'params')),
  asyncHandler(workspaceMiddleware.checkPermission(WORKSPACE_PERMISSIONS.VIEW)),
  asyncHandler(WorkspaceController.downloadExport)
)

Router.route('/roles').post(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(
    workspaceMiddleware.checkPermission(WORKSPACE_PERMISSIONS.ROLE_CREATE)
  ),
  asyncHandler(WorkspaceController.createRole)
)

Router.route('/roles/:workspaceId').put(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(validate(createIdParamSchema('workspaceId'), 'params')),
  asyncHandler(
    workspaceMiddleware.checkPermission(WORKSPACE_PERMISSIONS.ROLE_UPDATE)
  ),
  asyncHandler(WorkspaceController.updateRole)
)

Router.route('/roles/:workspaceId/:roleId').delete(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(
    workspaceMiddleware.checkPermission(WORKSPACE_PERMISSIONS.ROLE_DELETE)
  ),
  asyncHandler(WorkspaceController.deleteRole)
)

Router.route('/:workspaceId')
  .get(
    asyncHandler(authMiddleware.isAuthorized),
    asyncHandler(validate(createIdParamSchema('workspaceId'), 'params')),
    asyncHandler(
      workspaceMiddleware.checkPermission(WORKSPACE_PERMISSIONS.VIEW)
    ),
    asyncHandler(WorkspaceController.fetchWorkspaceInfo)
  )
  .put(
    asyncHandler(authMiddleware.isAuthorized),
    asyncHandler(validate(createIdParamSchema('workspaceId'), 'params')),
    asyncHandler(
      workspaceMiddleware.checkPermission(WORKSPACE_PERMISSIONS.UPDATE)
    ),
    asyncHandler(WorkspaceController.update)
  )
  .delete(
    asyncHandler(authMiddleware.isAuthorized),
    asyncHandler(validate(createIdParamSchema('workspaceId'), 'params')),
    asyncHandler(
      workspaceMiddleware.checkPermission(WORKSPACE_PERMISSIONS.DELETE)
    ),
    asyncHandler(WorkspaceController.delete)
  )

export const workspaceRoute = Router
