import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { createNewBoardsAPI, fetchBoardsAPI } from '~/apis'
import { fetchBoardOverviewAPI } from '~/apis/board.api'
import { useParams } from 'react-router-dom'

const useBoardList = () => {
  const [boards, setBoards] = useState([])
  const [workspace, setWorkspace] = useState(null)
  const [totalBoards, setTotalBoards] = useState(0)
  const [isOpenCreateBoard, setIsOpenCreateBoard] = useState(false)
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const page = parseInt(query.get('page') || '1', 10)
  const { workspaceId } = useParams()

  const updateStateData = (res) => {
    setWorkspace(res)
    // setTotalBoards(res.totalBoards || 0)
  }

  useEffect(() => {
    fetchBoardOverviewAPI(location.search).then(updateStateData)
  }, [location.search])

  const handleOpenCreateBoard = () => setIsOpenCreateBoard(true)
  const handleCloseCreateBoard = () => setIsOpenCreateBoard(false)

  const handleCreateBoard = async (data) => {
    const payload = {
      ...data,
      workspaceId
    }

    const board = await createNewBoardsAPI(payload)
    setBoards((prev) => [board, ...prev])
    handleCloseCreateBoard()
  }

  

  return {
    ui: {
      board: {
        page
      },
      createModal: {
        isOpen: isOpenCreateBoard
      }
    },
    data: {
      board: { boards, totalBoards },
      workspace: { workspace, totalBoards }
    },
    handler: {
      sideBar: {
        handleOpenCreateBoard
      },
      createModal: {
        handleCreateBoard,
        handleClose: handleCloseCreateBoard
      },
    }
  }
}
export default useBoardList
