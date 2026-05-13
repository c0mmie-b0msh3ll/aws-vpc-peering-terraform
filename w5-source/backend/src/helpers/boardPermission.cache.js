import { deleteCache, deleteCachesByPattern } from '~/helpers/cache'

const getBoardAccessCacheKey = ({ boardId, userId }) =>
  `board_access:${boardId}:${userId}`

const invalidateBoardAccessCache = async ({ boardId, userId }) => {
  return await deleteCache({
    key: getBoardAccessCacheKey({ boardId, userId })
  })
}

const invalidateBoardAccessCachesByBoard = async ({ boardId }) => {
  return await deleteCachesByPattern({
    pattern: `board_access:${boardId}:*`
  })
}

export {
  getBoardAccessCacheKey,
  invalidateBoardAccessCache,
  invalidateBoardAccessCachesByBoard
}
