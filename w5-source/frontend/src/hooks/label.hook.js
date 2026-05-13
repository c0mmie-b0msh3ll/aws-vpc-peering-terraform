import { useDispatch } from 'react-redux'
import {
  createLabelAPI,
  deleteLabelAPI,
  updateLabelAPI
} from '~/redux/activeBoard/activeBoardSlice'

export const useLabel = () => {
  const dispatch = useDispatch()

  const handleCreateLabel = async (data) => {
    const payload = {
      boardId: data.boardId,
      title: data.title,
      color: data.color
    }
    await dispatch(createLabelAPI({ payload }))
  }

  const handleUpdateLabel = async (data) => {
    const payload = { title: data.title, color: data.color }
    await dispatch(
      updateLabelAPI({ _id: data._id, boardId: data.boardId, payload })
    )
  }

  const handleDeleteLabel = async (data) => {
    await dispatch(deleteLabelAPI({ _id: data._id, boardId: data.boardId }))
  }

  return {
    handleCreateLabel,
    handleUpdateLabel,
    handleDeleteLabel
  }
}
