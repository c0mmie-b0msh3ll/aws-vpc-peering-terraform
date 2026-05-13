import { GET_SOCKET } from '~/config/socket'
import { REALTIME_EVENTS } from '~/realtime/realtime.events'
import { getBoardRoom } from '~/realtime/realtime.rooms'

const emitCommentCreated = ({ boardId, card, comment, log }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.COMMENT_CREATED, {
    boardId: String(boardId),
    card,
    comment,
    log
  })
}

const emitCommentDeleted = ({ boardId, card, comment, log }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.COMMENT_DELETED, {
    boardId: String(boardId),
    card,
    comment,
    log
  })
}

export { emitCommentCreated, emitCommentDeleted }
