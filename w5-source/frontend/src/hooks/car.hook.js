import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch, useSelector } from 'react-redux'
import { updateCardInBoard } from '~/redux/activeBoard/activeBoardSlice'
import {
  fetchCardDetailAPI,
  showModalActiveCard,
  updateCardBasicAPI
} from '~/redux/activeCard/activeCardSlice'

const useCard = ({ card }) => {
  const dispatch = useDispatch()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card._id,
    data: { ...card }
  })
  const dndKitCardStyles = {
    // touchAction: 'none', // Dành cho sensor default dạng PointerSensor
    // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch
    // https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #2ecc71' : undefined
  }

  const setActiveCard = () => {
    dispatch(fetchCardDetailAPI({ _id: card._id }))
    // dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  const handleUpdateIsCompleted = async () => {
    const updatedCard = await dispatch(
      updateCardBasicAPI({
        _id: card._id,
        boardId: card.boardId,
        payload: { isCompleted: !card.isCompleted }
      })
    )
    dispatch(updateCardInBoard(updatedCard.payload.card))
  }

  return {
    setNodeRef,
    attributes,
    listeners,
    dndKitCardStyles,
    setActiveCard,
    handleUpdateIsCompleted
  }
}
export default useCard
