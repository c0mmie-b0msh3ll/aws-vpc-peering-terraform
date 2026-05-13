import { GET_SOCKET } from '~/config/socket'
import { REALTIME_EVENTS } from '~/realtime/realtime.events'
import { getBoardRoom } from '~/realtime/realtime.rooms'

const emitAttachmentCreated = ({ boardId, card, attachments, log }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.ATTACHMENT_CREATED, {
    boardId: String(boardId),
    card,
    attachments,
    log
  })
}

const emitAttachmentUpdated = ({ boardId, card, attachment }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.ATTACHMENT_UPDATED, {
    boardId: String(boardId),
    card,
    attachment
  })
}

const emitAttachmentDeleted = ({ boardId, card, attachment, log }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.ATTACHMENT_DELETED, {
    boardId: String(boardId),
    card,
    attachment,
    log
  })
}

export { emitAttachmentCreated, emitAttachmentUpdated, emitAttachmentDeleted }
