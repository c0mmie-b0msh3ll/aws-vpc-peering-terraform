import { createClient } from 'redis'
import { env } from '../config/environment.js'

let redisRealtimePubClientInstance = null
let redisRealtimeSubClientInstance = null

const CONNECT_REDIS_REALTIME = async () => {
  if (redisRealtimePubClientInstance && redisRealtimeSubClientInstance) {
    return {
      pubClient: redisRealtimePubClientInstance,
      subClient: redisRealtimeSubClientInstance
    }
  }

  redisRealtimePubClientInstance = createClient({
    socket: {
      host: env.REDIS_REALTIME_HOST,
      port: env.REDIS_REALTIME_PORT
    },
    password: env.REDIS_REALTIME_PASSWORD || undefined
  })

  redisRealtimeSubClientInstance = redisRealtimePubClientInstance.duplicate()

  redisRealtimePubClientInstance.on('error', (err) => {
    console.error('Redis Realtime Pub Client Error:', err)
  })

  redisRealtimePubClientInstance.on('connect', () => {
    console.log('Redis realtime pub client is connecting...')
  })

  redisRealtimePubClientInstance.on('ready', () => {
    console.log('Redis realtime pub client connected successfully.')
  })

  redisRealtimePubClientInstance.on('reconnecting', () => {
    console.log('Redis realtime pub client reconnecting...')
  })

  redisRealtimePubClientInstance.on('end', () => {
    console.log('Redis realtime pub client disconnected.')
  })

  redisRealtimeSubClientInstance.on('error', (err) => {
    console.error('Redis Realtime Sub Client Error:', err)
  })

  redisRealtimeSubClientInstance.on('connect', () => {
    console.log('Redis realtime sub client is connecting...')
  })

  redisRealtimeSubClientInstance.on('ready', () => {
    console.log('Redis realtime sub client connected successfully.')
  })

  redisRealtimeSubClientInstance.on('reconnecting', () => {
    console.log('Redis realtime sub client reconnecting...')
  })

  redisRealtimeSubClientInstance.on('end', () => {
    console.log('Redis realtime sub client disconnected.')
  })

  await redisRealtimePubClientInstance.connect()
  await redisRealtimeSubClientInstance.connect()

  return {
    pubClient: redisRealtimePubClientInstance,
    subClient: redisRealtimeSubClientInstance
  }
}

const GET_REDIS_REALTIME = () => {
  if (!redisRealtimePubClientInstance || !redisRealtimeSubClientInstance) {
    throw new Error(
      'Redis realtime is not connected. Call CONNECT_REDIS_REALTIME first.'
    )
  }

  return {
    pubClient: redisRealtimePubClientInstance,
    subClient: redisRealtimeSubClientInstance
  }
}

const CLOSE_REDIS_REALTIME = async () => {
  if (redisRealtimePubClientInstance) {
    await redisRealtimePubClientInstance.quit()
    redisRealtimePubClientInstance = null
  }

  if (redisRealtimeSubClientInstance) {
    await redisRealtimeSubClientInstance.quit()
    redisRealtimeSubClientInstance = null
  }
}

export { CONNECT_REDIS_REALTIME, GET_REDIS_REALTIME, CLOSE_REDIS_REALTIME }
