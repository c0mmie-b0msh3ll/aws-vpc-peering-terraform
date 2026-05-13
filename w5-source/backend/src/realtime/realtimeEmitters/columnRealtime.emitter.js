import { GET_SOCKET } from '~/config/socket'
import { REALTIME_EVENTS } from '~/realtime/realtime.events'
import { getBoardRoom } from '~/realtime/realtime.rooms'

const emitColumnCreated = ({ boardId, column }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.COLUMN_CREATED, {
    boardId: String(boardId),
    column
  })
}

const emitColumnUpdated = ({ boardId, column }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.COLUMN_UPDATED, {
    boardId: String(boardId),
    column
  })
}

const emitColumnArchived = ({ boardId, column }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.COLUMN_ARCHIVED, {
    boardId: String(boardId),
    column
  })
}

const emitColumnRestored = ({ boardId, column }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.COLUMN_RESTORED, {
    boardId: String(boardId),
    column
  })
}

const emitColumnDeleted = ({ boardId, column }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.COLUMN_DELETED, {
    boardId: String(boardId),
    column
  })
}

export {
  emitColumnCreated,
  emitColumnUpdated,
  emitColumnArchived,
  emitColumnRestored,
  emitColumnDeleted
}
