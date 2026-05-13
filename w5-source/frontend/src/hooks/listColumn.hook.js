import { useState } from 'react'
import { toast } from 'react-toastify'
import { createNewColumnAPI } from '~/apis'
import { useSelector, useDispatch } from 'react-redux'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { cloneDeep } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

const useListColum = () => {
  const dispatch = useDispatch()

  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const [newColumnTitle, setNewColumnTitle] = useState('')

  const board = useSelector((state) => state.activeBoard?.board)

  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Please enter Column Title!')
      return
    }

    const newColumnData = {
      title: newColumnTitle,
      color: 'default'
    }

    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    // Khi tạo column mới thì nó sẽ chưa có card, cần xử lý vấn đề kéo thả vào một column rỗng (Nhớ lại video 37.2, code hiện tại là video 69)
    createdColumn.cards = [generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]

    const newBoard = cloneDeep(board)

    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    dispatch(updateCurrentActiveBoard(newBoard))

    // toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }


  return {
    openNewColumnForm,
    toggleOpenNewColumnForm,
    newColumnTitle,
    setNewColumnTitle,
    addNewColumn
  }
}

export default useListColum
