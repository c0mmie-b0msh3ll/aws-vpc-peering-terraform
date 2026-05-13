import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchWorkspacesAPI,
  createWorkspaceAPI
} from '~/redux/workspace/workspacesSlice'

export const useHomeLayout = () => {
  const dispatch = useDispatch()
  const workspaces = useSelector((state) => state.workspaces)
  const [isCreating, setIsCreating] = useState(false)
  const [isOpenCreateWorkspaceModal, setIsOpenCreateWorkspaceModal] =
    useState(false)

  useEffect(() => {
    dispatch(fetchWorkspacesAPI())
  }, [dispatch])

  const handleOpenCreateWorkspaceModal = () =>
    setIsOpenCreateWorkspaceModal(true)

  const handleCloseCreateWorkspaceModal = () => {
    if (isCreating) return
    setIsOpenCreateWorkspaceModal(false)
  }

  const handleCreateWorkspace = async (data) => {
    setIsCreating(true)
    try {
      await dispatch(createWorkspaceAPI({ payload: data }))
      handleCloseCreateWorkspaceModal()
    } catch {
      throw new Error()
    } finally {
      setIsCreating(false)
    }
  }

  return {
    workspaces,
    handleOpenCreateWorkspaceModal,
    createModal: {
      isOpen: isOpenCreateWorkspaceModal,
      loading: isCreating,
      onClose: handleCloseCreateWorkspaceModal,
      onSubmit: handleCreateWorkspace
    }
  }
}
