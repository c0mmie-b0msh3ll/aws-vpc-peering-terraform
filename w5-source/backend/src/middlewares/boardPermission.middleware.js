import { ObjectId } from 'mongodb'
import {
  ForbiddenErrorResponse,
  NotFoundErrorResponse,
  UnAuthorizedErrorResponse
} from '~/core/error.response'
import { getCache, setCache } from '~/helpers/cache'
import BoardRepo from '~/repo/board.repo'
import BoardMemberRepo from '~/repo/boardMember.repo'
import BoardRoleRepo from '~/repo/boardRole.repo'

const BOARD_ACCESS_CACHE_TTL = 120

const getBoardAccessCacheKey = ({ boardId, userId }) =>
  `board_access:${boardId}:${userId}`

const parseCacheData = (data) => {
  if (!data) return null
  if (typeof data === 'object') return data

  try {
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

const buildBoardAccessCacheData = ({ board, boardMember, boardRole }) => ({
  board: {
    _id: board._id?.toString(),
    title: board.title,
    status: board.status,
    workspaceId: board.workspaceId
  },
  boardMember: {
    _id: boardMember._id?.toString(),
    boardId: boardMember.boardId?.toString(),
    workspaceMemberId: boardMember.workspaceMemberId?.toString(),
    boardRoleId: boardMember.boardRoleId?.toString(),
    status: boardMember.status
  },
  boardRole: {
    _id: boardRole._id?.toString(),
    boardId: boardRole.boardId?.toString(),
    name: boardRole.name
  },
  permissionCodes: boardRole.permissionCodes || [],
  cachedAt: Date.now()
})

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const userId = req.userContext?._id?.toString()
    const boardId = req.params?.boardId || req.body?.boardId

    if (!userId) {
      throw new UnAuthorizedErrorResponse('Unauthorized.')
    }

    if (!boardId) {
      throw new NotFoundErrorResponse('Board id not found.')
    }

    if (!ObjectId.isValid(boardId)) {
      throw new NotFoundErrorResponse('Board id is invalid.')
    }

    const cacheKey = getBoardAccessCacheKey({ boardId, userId })
    const cachedData = parseCacheData(await getCache({ key: cacheKey }))

    if (cachedData) {
      const permissions = new Set(cachedData.permissionCodes || [])

      if (requiredPermission && !permissions.has(requiredPermission)) {
        throw new ForbiddenErrorResponse(
          'You do not have permission to perform this action.'
        )
      }

      req.boardAccess = cachedData
      return next()
    }

    const board = await BoardRepo.findOne({
      filter: {
        _id: new ObjectId(boardId),
        status: 'active'
      }
    })

    if (!board) {
      throw new NotFoundErrorResponse('Board not found.')
    }

    const boardMember = await BoardMemberRepo.findMemberInBoard({
      userId,
      boardId
    })

    if (!boardMember)
      throw new ForbiddenErrorResponse('You are not a member of this board.')

    if (
      !boardMember.boardRoleId ||
      !ObjectId.isValid(boardMember.boardRoleId)
    ) {
      throw new ForbiddenErrorResponse('Board role is invalid.')
    }

    const boardRole = await BoardRoleRepo.findOne({
      filter: {
        _id: new ObjectId(boardMember.boardRoleId),
        boardId
      }
    })

    if (!boardRole) {
      throw new ForbiddenErrorResponse('Board role not found.')
    }

    const permissions = new Set(boardRole.permissionCodes || [])

    if (requiredPermission && !permissions.has(requiredPermission)) {
      throw new ForbiddenErrorResponse(
        'You do not have permission to perform this action.'
      )
    }

    const boardAccessCacheData = buildBoardAccessCacheData({
      board,
      boardMember,
      boardRole
    })

    await setCache({
      key: cacheKey,
      value: boardAccessCacheData,
      ttlInSeconds: BOARD_ACCESS_CACHE_TTL
    })

    req.boardAccess = boardAccessCacheData
    next()
  }
}

export const boardMiddleware = {
  checkPermission
}
