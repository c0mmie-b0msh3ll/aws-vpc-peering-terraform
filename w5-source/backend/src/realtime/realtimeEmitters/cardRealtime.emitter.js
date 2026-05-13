import { GET_SOCKET } from '~/config/socket'
import { REALTIME_EVENTS } from '~/realtime/realtime.events'
import { getBoardRoom } from '~/realtime/realtime.rooms'

const emitCardUpdatedBasic = ({ boardId, card }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))
  const serializedCard = JSON.parse(JSON.stringify(card))

  io.to(boardRoom).emit(REALTIME_EVENTS.CARD_UPDATED, {
    boardId: String(boardId),
    card: serializedCard
  })
}

const emitCardCreated = ({ boardId, card }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.CARD_CREATED, {
    boardId: String(boardId),
    card
  })
}

const emitCardArchived = ({ boardId, card }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.CARD_ARCHIVED, {
    boardId: String(boardId),
    card
  })
}

const emitCardRestored = ({ boardId, card }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.CARD_RESTORED, {
    boardId: String(boardId),
    card
  })
}

const emitCardDeleted = ({ boardId, card }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.CARD_DELETED, {
    boardId: String(boardId),
    card
  })
}

const emitCardMoved = ({ boardId, card, prevColumn, nextColumn }) => {
  const io = GET_SOCKET()
  const boardRoom = getBoardRoom(String(boardId))

  io.to(boardRoom).emit(REALTIME_EVENTS.CARD_MOVED, {
    boardId: String(boardId),
    card,
    prevColumn,
    nextColumn
  })
}

export {
  emitCardUpdatedBasic,
  emitCardCreated,
  emitCardArchived,
  emitCardRestored,
  emitCardDeleted,
  emitCardMoved
}
