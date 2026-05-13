import { createClient } from 'redis'
import { env } from '../config/environment.js'

let redisClientInstance = null

const CONNECT_REDIS = async () => {
  if (redisClientInstance) return redisClientInstance

  redisClientInstance = createClient({
    socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      tls: env.REDIS_TLS === 'true'
    },
    password: env.REDIS_PASSWORD || undefined,
    database: env.REDIS_DB
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

const GET_REDIS = () => {
  if (!redisClientInstance)
    throw new Error('Redis is not connected. Call CONNECT_REDIS first.')
  return redisClientInstance
}

const CLOSE_REDIS = async () => {
  if (redisClientInstance) {
    await redisClientInstance.quit()
    redisClientInstance = null
  }
}

export { CONNECT_REDIS, GET_REDIS, CLOSE_REDIS }
