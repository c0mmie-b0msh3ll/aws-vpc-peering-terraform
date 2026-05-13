import { GET_REDIS_CACHE } from '~/config/redisCache'

const DEFAULT_TTL_IN_SECONDS = 120

const buildCacheKey = (...parts) => {
  return parts
    .filter((part) => part !== undefined && part !== null && part !== '')
    .map((part) => String(part).trim())
    .join(':')
}

const setCache = async ({
  key,
  value,
  ttlInSeconds = DEFAULT_TTL_IN_SECONDS
}) => {
  const redisClient = GET_REDIS_CACHE()

  if (!key) throw new Error('Cache key is required.')

  const normalizedValue =
    typeof value === 'string' ? value : JSON.stringify(value)

  if (ttlInSeconds && ttlInSeconds > 0) {
    await redisClient.set(key, normalizedValue, { EX: ttlInSeconds })
    return
  }

  await redisClient.set(key, normalizedValue)
}

const getCache = async ({ key }) => {
  const redisClient = GET_REDIS_CACHE()

  if (!key) throw new Error('Cache key is required.')

  return await redisClient.get(key)
}

const getCacheJSON = async ({ key }) => {
  const data = await getCache({ key })
  if (!data) return null

  try {
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

const deleteCache = async ({ key }) => {
  const redisClient = GET_REDIS_CACHE()

  if (!key) throw new Error('Cache key is required.')

  return await redisClient.del(key)
}

const deleteManyCaches = async ({ keys = [] }) => {
  const redisClient = GET_REDIS_CACHE()

  if (!Array.isArray(keys) || keys.length === 0) return 0

  const validKeys = keys.filter(Boolean)
  if (validKeys.length === 0) return 0

  return await redisClient.del(validKeys)
}

const existsCache = async ({ key }) => {
  const redisClient = GET_REDIS_CACHE()

  if (!key) throw new Error('Cache key is required.')

  const result = await redisClient.exists(key)
  return result === 1
}

const expireCache = async ({ key, ttlInSeconds = DEFAULT_TTL_IN_SECONDS }) => {
  const redisClient = GET_REDIS_CACHE()

  if (!key) throw new Error('Cache key is required.')
  if (!ttlInSeconds || ttlInSeconds <= 0) return false

  return await redisClient.expire(key, ttlInSeconds)
}

const getOrSetCacheJSON = async ({
  key,
  ttlInSeconds = DEFAULT_TTL_IN_SECONDS,
  callback
}) => {
  if (!key) throw new Error('Cache key is required.')
  if (typeof callback !== 'function')
    throw new Error('Callback must be a function.')

  const cachedData = await getCacheJSON(key)
  if (cachedData) return cachedData

  const freshData = await callback()

  if (freshData !== undefined && freshData !== null) {
    await setCache({
      key,
      value: freshData,
      ttlInSeconds
    })
  }

  return freshData
}

const scanKeysByPattern = async ({ pattern }) => {
  const redisClient = GET_REDIS_CACHE()

  if (!pattern) throw new Error('Pattern is required.')

  const matchedKeys = []
  let cursor = '0'

  do {
    const reply = await redisClient.scan(cursor, {
      MATCH: pattern,
      COUNT: 100
    })

    cursor = reply.cursor
    matchedKeys.push(...reply.keys)
  } while (cursor !== '0')

  return matchedKeys
}

const deleteCachesByPattern = async ({ pattern }) => {
  const keys = await scanKeysByPattern({ pattern })
  if (keys.length === 0) return 0

  return await deleteManyCaches({ keys })
}

export {
  DEFAULT_TTL_IN_SECONDS,
  buildCacheKey,
  setCache,
  getCache,
  getCacheJSON,
  deleteCache,
  deleteManyCaches,
  existsCache,
  expireCache,
  getOrSetCacheJSON,
  scanKeysByPattern,
  deleteCachesByPattern
}
