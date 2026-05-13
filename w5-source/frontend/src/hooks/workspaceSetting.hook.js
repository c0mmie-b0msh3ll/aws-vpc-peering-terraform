import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchWorkspaceRoleAPI,
  fetchWorkspacePermissionAPI,
  createWorkspaceRoleAPI,
  updateWorkspaceRoleAPI,
  deleteWorkspaceRoleAPI
} from '~/apis/workspace.api'
import { deleteWorkspaceAPI } from '~/redux/workspace/workspacesSlice'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

export const useWorkspaceSetting = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { workspaceId } = useParams()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [deleteRoleId, setDeleteRoleId] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [roles, setRoles] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false)

  useEffect(() => {
    const fetchWorkspaceRole = async () => {
      const data = await fetchWorkspaceRoleAPI({ _id: workspaceId })
      setRoles(data)
    }

    const fetchWorkspacePermission = async () => {
      const data = await fetchWorkspacePermissionAPI()
      setPermissions(data)
    }

    fetchWorkspaceRole()
    fetchWorkspacePermission()
  }, [workspaceId])

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
      const resData = await createWorkspaceRoleAPI({
        payload: {
          workspaceId,
          ...data
        }
      })
      setRoles((prev) => [...prev, resData])
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateRole = async () => {
    setIsUpdating(true)
    try {
      await updateWorkspaceRoleAPI({ workspaceId, payload: roles })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteRole = async () => {
    setIsDeleting(true)
    try {
      await deleteWorkspaceRoleAPI({ workspaceId, roleId: deleteRoleId })
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

  const handleDeleteWorkspace = async () => {
    setIsDeletingWorkspace(true)
    try {
      await dispatch(deleteWorkspaceAPI({ _id: workspaceId }))
      navigate('/h')
    } catch {
      throw new Error()
    } finally {
      setIsDeletingWorkspace(false)
    }
  }

  return {
    ui: {
      isUpdating,
      isDeletingWorkspace,
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
      }
    },

    data: {
      roles,
      roleCard: { permissions },
      createModal: { permissions }
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
      handleDeleteWorkspace,
      handleUpdateRole
    }
  }
}
