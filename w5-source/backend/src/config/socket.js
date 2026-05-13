import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { CONNECT_REDIS_REALTIME } from '~/config/redisRealtime'
import { corsOptions } from '~/config/cors'
import { registerBoardSocket } from '~/sockets/socketHandlers/board.socket'

let ioInstance = null

const INIT_SOCKET = async (httpServer) => {
  if (ioInstance) return ioInstance

  const { pubClient, subClient } = await CONNECT_REDIS_REALTIME()

  ioInstance = new Server(httpServer, {
    cors: corsOptions
    // transports: ['websocket']
  })

  ioInstance.adapter(createAdapter(pubClient, subClient))

  ioInstance.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    registerBoardSocket(socket)

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`)
    })
  })

  return ioInstance
}

const GET_SOCKET = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized. Call INIT_SOCKET first.')
  }

  return ioInstance
}

export { INIT_SOCKET, GET_SOCKET }
