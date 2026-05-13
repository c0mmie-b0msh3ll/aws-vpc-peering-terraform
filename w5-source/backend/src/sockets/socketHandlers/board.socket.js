import { getBoardRoom } from '~/realtime/realtime.rooms'

const registerBoardSocket = (socket) => {
  console.log(`registerBoardSocket called for ${socket.id}`)

  socket.on('board:join', ({ boardId }) => {
    console.log('received board:join:', boardId)

    if (!boardId) return

    const normalizedBoardId = String(boardId)
    const boardRoom = getBoardRoom(normalizedBoardId)

    socket.join(boardRoom)
    console.log(`Socket ${socket.id} joined room: ${boardRoom}`)
  })

  socket.on('board:leave', ({ boardId }) => {
    console.log('received board:leave:', boardId)

    if (!boardId) return

    const normalizedBoardId = String(boardId)
    const boardRoom = getBoardRoom(normalizedBoardId)

    socket.leave(boardRoom)
    console.log(`Socket ${socket.id} left room: ${boardRoom}`)
  })
}

export { registerBoardSocket }
