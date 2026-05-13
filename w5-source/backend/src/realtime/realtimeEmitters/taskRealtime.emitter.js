import { GET_SOCKET } from '~/config/socket'
import { REALTIME_EVENTS } from '~/realtime/realtime.events'
import { getBoardRoom } from '~/realtime/realtime.rooms'

const emitTaskCreated = ({ boardId, task, log }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))
  io.to(boardRoom).emit(REALTIME_EVENTS.TASK_CREATED, {
    boardId: String(boardId),
    task,
    log
  })
}

const emitTaskUpdated = ({ boardId, card, task }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.TASK_UPDATED, {
    boardId: String(boardId),
    card,
    task
  })
}

const emitTaskDeleted = ({ boardId, card, task, log }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.TASK_DELETED, {
    boardId: String(boardId),
    card,
    task,
    log
  })
}

export { emitTaskCreated, emitTaskUpdated, emitTaskDeleted }
