import { useState } from 'react'
import { toast } from 'react-toastify'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  createNewCardAPI,
  deleteColumnDetailsAPI,
  updateColumnDetailsAPI
} from '~/apis'
import { useSelector, useDispatch } from 'react-redux'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { cloneDeep } from 'lodash'
import { archivedColumnAPI } from '~/apis/board.api'

const useColumn = ({ column }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column._id,
    data: { ...column }
  })

  const dndKitColumnStyles = {
    // touchAction: 'none', // Dành cho sensor default dạng PointerSensor
    // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch
    // https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    // Chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo column ngắn qua một cái column dài thì phải kéo ở khu vực giữa giữa rất khó chịu (demo ở video 32). Lưu ý lúc này phải kết hợp với {...listeners} nằm ở Box chứ không phải ở div ngoài cùng để tránh trường hợp kéo vào vùng xanh.
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const orderedCards = column.cards

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const [newCardTitle, setNewCardTitle] = useState('')

  const board = useSelector((state) => state.activeBoard?.board)
  const dispatch = useDispatch()

  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please enter Card Title!', { position: 'bottom-right' })
      return
    }

    const newCardData = {
      title: newCardTitle,
      columnId: column._id
    }

    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })

    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === createdCard.columnId
    )
    if (columnToUpdate) {
      if (columnToUpdate.cards.some((card) => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id]
      } else {
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }

    dispatch(updateCurrentActiveBoard(newBoard))

    setNewCardTitle('')
  }

  const handleArchiveColumn = async () => {
    await archivedColumnAPI({
      columnId: column._id,
      boardId: column.boardId
    })

    const newBoard = cloneDeep(board)
    newBoard.columns = newBoard.columns.filter((c) => c._id !== column._id)
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(
      (_id) => _id !== column._id
    )

    dispatch(updateCurrentActiveBoard(newBoard))
  }

  const onUpdateColumnTitle = async (newTitle) => {
    const payload = { title: newTitle }

    const updatedColumn = await updateColumnDetailsAPI({
      boardId: column.boardId,
      columnId: column._id,
      payload
    })

    const newBoard = {
      ...board,
      columns: board?.columns?.map((c) =>
        c._id === column._id ? { ...updatedColumn, cards: c.cards } : c
      )
    }

    dispatch(updateCurrentActiveBoard(newBoard))
  }

  const onUpdateColumnColor = async (newColor) => {
    const payload = { color: newColor }

    const updatedColumn = await updateColumnDetailsAPI({
      boardId: column.boardId,
      columnId: column._id,
      payload
    })

    const newBoard = {
      ...board,
      columns: board?.columns?.map((c) =>
        c._id === column._id ? { ...updatedColumn, cards: c.cards } : c
      )
    }

    dispatch(updateCurrentActiveBoard(newBoard))
  }

  const truncateText = (text, maxLength) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return {
    setNodeRef,
    dndKitColumnStyles,
    attributes,
    listeners,
    anchorEl,
    open,
    handleClick,
    handleClose,
    orderedCards,
    openNewCardForm,
    toggleOpenNewCardForm,
    newCardTitle,
    setNewCardTitle,
    addNewCard,
    handleArchiveColumn,
    onUpdateColumnTitle,
    onUpdateColumnColor, truncateText
  }
}

export default useColumn
