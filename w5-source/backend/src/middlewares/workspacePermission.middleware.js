import { ObjectId } from 'mongodb'
import {
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import { getCache, setCache } from '~/helpers/cache'
import WorkspaceRepo from '~/repo/workspace.repo'
import WorkspaceMemberRepo from '~/repo/workspaceMember.repo'
import WorkspaceRoleRepo from '~/repo/workspaceRole.repo'

// const WORKSPACE_ACCESS_CACHE_TTL = 120
const WORKSPACE_ACCESS_CACHE_TTL = 1

const getWorkspaceAccessCacheKey = ({ workspaceId, userId }) =>
  `workspace_access:${workspaceId}:${userId}`

const parseCacheData = (data) => {
  if (!data) return null
  if (typeof data === 'object') return data

  try {
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const userId = req.userContext?._id?.toString()
    const workspaceId = req.params?.workspaceId || req.body?.workspaceId

    if (!workspaceId) throw new NotFoundErrorResponse('Workspace id not found.')

    const cacheKey = getWorkspaceAccessCacheKey({ workspaceId, userId })

    const cachedData = parseCacheData(await getCache({ key: cacheKey }))

    if (cachedData) {
      const permissionCodes = cachedData.permissionCodes || []
      const permissions = new Set(permissionCodes)

      if (requiredPermission && !permissions.has(requiredPermission)) {
        throw new ForbiddenErrorResponse(
          'You do not have permission to perform this action.'
        )
      }

      req.workspaceAccess = {
        ...cachedData,
        permissions
      }

      return next()
    }

    const workspace = await WorkspaceRepo.findOne({
      filter: { _id: new ObjectId(workspaceId) }
    })

    if (!workspace) throw new NotFoundErrorResponse('Workspace not found.')

    const workspaceMember = await WorkspaceMemberRepo.findOne({
      filter: {
        workspaceId: workspaceId,
        userId: userId,
        status: 'active'
      }
    })

    if (!workspaceMember) {
      throw new ForbiddenErrorResponse(
        'You are not a member of this workspace.'
      )
    }

    const workspaceRole = await WorkspaceRoleRepo.findOne({
      filter: {
        _id: new ObjectId(workspaceMember.workspaceRoleId),
        workspaceId: workspaceId
      }
    })

    if (!workspaceRole) {
      throw new ForbiddenErrorResponse('Workspace role not found.')
    }

    const permissionCodes = workspaceRole.permissionCodes || []
    const permissions = new Set(permissionCodes)

    if (requiredPermission && !permissions.has(requiredPermission)) {
      throw new ForbiddenErrorResponse(
        'You do not have permission to perform this action.'
      )
    }

    const workspaceAccessCacheData = {
      workspace: {
        _id: workspace._id?.toString(),
        title: workspace.title,
        status: workspace.status
      },
      workspaceMember: {
        _id: workspaceMember._id?.toString(),
        workspaceId: workspaceMember.workspaceId?.toString(),
        userId: workspaceMember.userId?.toString(),
        workspaceRoleId: workspaceMember.workspaceRoleId?.toString(),
        status: workspaceMember.status
      },
      workspaceRole: {
        _id: workspaceRole._id?.toString(),
        workspaceId: workspaceRole.workspaceId?.toString(),
        name: workspaceRole.name
      },
      permissionCodes,
      cachedAt: Date.now()
    }

    await setCache({
      key: cacheKey,
      value: workspaceAccessCacheData,
      ttlInSeconds: WORKSPACE_ACCESS_CACHE_TTL
    })

    req.workspaceAccess = {
      ...workspaceAccessCacheData,
      permissions
    }

    next()
  }
}

export const workspaceMiddleware = {
  checkPermission
}
