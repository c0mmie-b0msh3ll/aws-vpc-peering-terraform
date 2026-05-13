import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  createBoardRoleAPI,
  deleteBoardRoleAPI,
  fetchBoardPermissionAPI,
  fetchBoardRoleAPI,
  updateBoardRoleAPI,
  updateStatusBoardAPI
} from '~/apis/board.api'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export const useBoardSetting = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [deleteRoleId, setDeleteRoleId] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [roles, setRoles] = useState([])
  const { boardId } = useParams()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingBoard, setIsDeletingBoard] = useState(false)
  const board = useSelector((state) => state.activeBoard.board)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBoardRole = async () => {
      const data = await fetchBoardRoleAPI({ _id: boardId })
      setRoles(data)
    }

    const fetchBoardPermission = async () => {
      const data = await fetchBoardPermissionAPI()
      setPermissions(data)
    }

    fetchBoardRole()
    fetchBoardPermission()
  }, [boardId])

  const handleChangeRolePermissions = ({ roleId, permissionCode, action }) => {
    setRoles((prev) => {
      return prev.map((r) => {
        if (r._id === roleId) {
          if (action === 'add') {
            return {
              ...r,
              permissionCodes: [...r.permissionCodes, permissionCode]
            }
          } else {
            return {
              ...r,
              permissionCodes: r.permissionCodes.filter(
                (code) => code !== permissionCode
              )
            }
          }
        }
        return r
      })
    })
  }

  const handleChangeRoleName = ({ roleId, value }) => {
    setRoles((prev) =>
      prev.map((r) => (r._id === roleId ? { ...r, name: value } : r))
    )
  }

  const handleOpenCreateModal = () => setOpenCreateModal(true)
  const handleCloseCreateModal = () => setOpenCreateModal(false)

  const handleCreateRole = async (data) => {
    setIsCreating(true)
    try {
      const resData = await createBoardRoleAPI({
        payload: {
          boardId,
          ...data
        }
      })
      setRoles((prev) => [...prev, resData.metadata])
      setAlert({
        open: true,
        severity: 'success',
        message: resData.message
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateRole = async () => {
    setIsUpdating(true)
    try {
      const resData = await updateBoardRoleAPI({ boardId, payload: roles })
      setAlert({
        open: true,
        severity: 'success',
        message: resData.message
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteRole = async () => {
    setIsDeleting(true)
    try {
      const resData = await deleteBoardRoleAPI({
        boardId,
        roleId: deleteRoleId
      })
      setAlert({
        open: true,
        severity: 'success',
        message: resData.message
      })
    } catch {
      throw Error()
    } finally {
      setIsDeleting(false)
    }

    setRoles((prev) => prev.filter((r) => r._id !== deleteRoleId))
    handleCloseConfirmDialog()
  }

  const handleOpenConfirmDialog = ({ roleId }) => {
    setDeleteRoleId(roleId)
    setOpenConfirmDialog(true)
  }

  const handleCloseConfirmDialog = () => {
    setDeleteRoleId(null)
    setOpenConfirmDialog(false)
  }

  const handleDeleteBoard = async () => {
    setIsDeletingBoard(false)
    try {
      const resData = await updateStatusBoardAPI({
        _id: boardId,
        data: {}
      })
      setAlert({
        open: true,
        severity: 'success',
        message: resData.message
      })
      setIsDeleting(false)
      setTimeout(() => {
        navigate('/h')
      }, 2000)
      return true
    } catch (error) {
      console.error('Update board status failed:', error)
    } finally {
      setIsDeletingBoard(false)
    }
  }

  const [alert, setAlert] = useState({
    open: false,
    severity: 'success',
    message: ''
  })

  return {
    ui: {
      isUpdating,
      isDeletingBoard,
      createModal: {
        open: openCreateModal,
        isSubmitting: isCreating
      },
      confirmDialog: {
        open: openConfirmDialog,
        loading: isDeleting,
        title: 'Confirm delete role',
        description:
          'Are you sure you want to delete this role? This action cannot be undone.'
      },
      alert
    },

    data: {
      roles,
      roleCard: { permissions },
      createModal: { permissions },
      board
    },

    handler: {
      roleCard: {
        handleOpenConfirmDialog,
        handleChangeRoleName,
        handleChangeRolePermissions
      },
      createModal: {
        handleCreate: handleCreateRole,
        onClose: handleCloseCreateModal
      },
      confirmDialog: {
        onConfirm: handleDeleteRole,
        onClose: handleCloseConfirmDialog
      },
      handleOpenCreateModal,
      handleUpdateRole,
      handleDeleteBoard
    }
  }
}
