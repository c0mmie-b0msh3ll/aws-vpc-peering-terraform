import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { aiGenerateBoardAPI, createNewBoardsAPI } from '~/apis'
import { fetchBoardByWorkspaceIdAPI } from '~/apis/board.api'

export const useWorkspaceBoards = () => {
  const [boards, setBoards] = useState([])
  const [count, setCount] = useState(0)
  const [isOpenCreateBoard, setIsOpenCreateBoard] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const { workspaceId } = useParams()

  useEffect(() => {
    const fetchWorkspaceBoards = async () => {
      const data = await fetchBoardByWorkspaceIdAPI({ workspaceId })
      setBoards(data.boards)
      setCount(data.count)
    }
    fetchWorkspaceBoards()
  }, [workspaceId])

  const handleOpenCreateBoard = () => setIsOpenCreateBoard(true)
  const handleCloseCreateBoard = () => setIsOpenCreateBoard(false)

  const handleCreateBoard = async (data) => {
    try {
      setIsSubmitting(true)
      const payload = {
        ...data,
        workspaceId
      }
      const board = await createNewBoardsAPI(payload)
      setBoards((prev) => [board, ...prev])
      handleCloseCreateBoard()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAIGenerateBoard = async (prompt) => {
    try {
      setIsSubmitting(true)
      const board = await aiGenerateBoardAPI({ prompt, workspaceId })
      setBoards((prev) => [board, ...prev])
      return board
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    ui: { boardList: { page: 1, createModal: { isOpen: isOpenCreateBoard } } },
    data: { boardList: { boards, count } },
    handler: {
      boardList: {
        handleOpenCreateBoard,
        createModal: {
          isSubmitting,
          handleCreateBoard,
          handleClose: handleCloseCreateBoard,
          handleAIGenerateBoard
        }
      }
    }
  }
}
