import { io } from 'socket.io-client'

let socketInstance = null

const initSocket = () => {
  if (socketInstance) return socketInstance

  // socketInstance = io('http://localhost:8017', {
  //   withCredentials: true
  //   // transports: ['websocket']
  // })

  socketInstance = io(window.location.origin, {
    withCredentials: true,
    transports: ['websocket']
  })

  socketInstance.on('connect', () => {
    console.log('Socket connected:', socketInstance.id)
  })

  socketInstance.on('connect_error', (error) => {
    console.error('Socket connect error:', error)
  })

  socketInstance.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason)
  })

  return socketInstance
}

const getSocket = () => {
  if (!socketInstance) {
    throw new Error('Socket is not initialized. Call initSocket first.')
  }

  return socketInstance
}

const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

export { initSocket, getSocket, disconnectSocket }
