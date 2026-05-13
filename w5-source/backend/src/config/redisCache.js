import { createClient } from 'redis'
import { env } from '../config/environment.js'

let redisClientInstance = null

const CONNECT_REDIS_CACHE = async () => {
  if (redisClientInstance) return redisClientInstance

  redisClientInstance = createClient({
    socket: {
      host: env.REDIS_CACHE_HOST,
      port: env.REDIS_CACHE_PORT
    },
    password: env.REDIS_CACHE_PASSWORD || undefined
  })

  redisClientInstance.on('error', (err) => {
    console.error('Redis Client Error:', err)
  })

  redisClientInstance.on('connect', () => {
    console.log('Redis client is connecting...')
  })

  redisClientInstance.on('ready', () => {
    console.log('Redis client connected successfully.')
  })

  redisClientInstance.on('reconnecting', () => {
    console.log('Redis client reconnecting...')
  })

  redisClientInstance.on('end', () => {
    console.log('Redis client disconnected.')
  })

  await redisClientInstance.connect()
  return redisClientInstance
}

const GET_REDIS_CACHE = () => {
  if (!redisClientInstance)
    throw new Error('Redis is not connected. Call CONNECT_REDIS_CACHE first.')
  return redisClientInstance
}

const CLOSE_REDIS_CACHE = async () => {
  if (redisClientInstance) {
    await redisClientInstance.quit()
    redisClientInstance = null
  }
}

export { CONNECT_REDIS_CACHE, GET_REDIS_CACHE, CLOSE_REDIS_CACHE }
