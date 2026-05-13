import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { fetchBackgroundAPI, fetchUpdateBoardInfoAPI } from '~/apis/board.api'
import { useEffect, useState, useCallback } from 'react'
import { backgroundBoardList } from '~/constant/backgroundBoard'

export function useBoardInfo() {
  const dispatch = useDispatch()
  const board = useSelector((state) => state.activeBoard.board)
  const [selectedBackground, setSelectedBackground] = useState(null)
  const [backgrounds, setBackgrounds] = useState([])

  const type = {
    PUBLIC: 'public',
    PRIVATE: 'private',
    WORKSPACE: 'workspace'
  }

  const descriptionType = {
    PUBLIC:
      'Anyone on the internet can see this board. Only board members can edit',
    PRIVATE:
      'Board members and Trello Workspace Workspace admins can see and edit this board.',
    WORKSPACE:
      'All members of the Trello Workspace Workspace can see and edit this board. '
  }

  const [alert, setAlert] = useState({
    open: false,
    severity: 'success',
    message: ''
  })

  const { boardId } = useParams()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      visibility: type.PRIVATE,
      cover: {
        type: board?.cover?.type || '',
        value: board?.cover?.value || ''
      }
    }
  })

  const getBackground = useCallback(async () => {
    try {
      const response = await fetchBackgroundAPI()

      const data = Array.isArray(response)
        ? response
        : response?.backgrounds || []

      const activeBackgrounds = data.filter(
        (item) => item.status === 'active' && !item.isDelete
      )

      setBackgrounds(activeBackgrounds)
      return activeBackgrounds
    } catch (error) {
      console.log(error)
      setBackgrounds([])
      return []
    }
  }, [])

  useEffect(() => {
    getBackground()
  }, [getBackground])

  useEffect(() => {
    if (!board) return

    reset({
      title: board.title || '',
      description: board.description || '',
      visibility: board.visibility || type.PRIVATE,
      cover: {
        type: board?.cover?.type || '',
        value: board?.cover?.value || ''
      }
    })

    if (board?.cover?.type === 'image') {
      const matchedImage = backgrounds.find(
        (item) => item.image === board.cover.value
      )

      setSelectedBackground(
        matchedImage || {
          _id: board.cover.value,
          image: board.cover.value,
          title: 'Current background'
        }
      )
    } else if (board?.cover?.type === 'color') {
      const matchedColor = backgroundBoardList.find(
        (item) => item.key === board.cover.value
      )

      setSelectedBackground(matchedColor || null)
    } else {
      setSelectedBackground(null)
    }
  }, [board, backgrounds, reset])

  const onSubmit = async (payload) => {
    const res = await fetchUpdateBoardInfoAPI({ _id: boardId, data: payload })

    dispatch(
      updateCurrentActiveBoard({
        ...board,
        ...res.metadata
      })
    )

    reset({
      title: res.metadata.title || board?.title || '',
      description: res.metadata.description || board?.description || '',
      visibility: res.metadata.visibility || board?.visibility || type.PUBLIC,
      cover: {
        type: res.metadata.cover?.type || board?.cover?.type || '',
        value: res.metadata.cover?.value || board?.cover?.value || ''
      }
    })

    if (res.metadata?.cover?.type === 'image') {
      const matchedImage = backgrounds.find(
        (item) => item.image === res.metadata.cover.value
      )

      setSelectedBackground(
        matchedImage || {
          _id: res.metadata.cover.value,
          image: res.metadata.cover.value,
          title: 'Updated background'
        }
      )
    } else if (res.metadata?.cover?.type === 'color') {
      const matchedColor = backgroundBoardList.find(
        (item) => item.key === res.metadata.cover.value
      )
      setSelectedBackground(matchedColor || null)
    }

    setAlert({
      open: true,
      severity: 'success',
      message: res.message
    })
  }

  return {
    register,
    handleSubmit,
    errors,
    reset,
    onSubmit,
    type,
    control,
    board,
    alert,
    descriptionType,
    setValue,
    setSelectedBackground,
    selectedBackground,
    backgrounds,
    getBackground
  }
}
