import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { updateWorkspaceAPI } from '~/redux/workspace/workspacesSlice'

export const useWorkspaceLayout = () => {
  const dispatch = useDispatch()
  const { workspaceId } = useParams()
  const workspace = useSelector((state) =>
    state?.workspaces?.find((w) => w._id === workspaceId)
  )

  const [openUpdateModal, setOpenUpdateModal] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenUpdateModal = () => setOpenUpdateModal(true)

  const handleCloseUpdateModal = () => setOpenUpdateModal(false)

  const handleUpdateWorkspace = async (data) => {
    setIsSubmitting(true)
    try {
      await dispatch(
        updateWorkspaceAPI({
          _id: workspaceId,
          payload: data
        })
      )
    } catch {
      throw new Error()
    } finally {
      setIsSubmitting(false)
      handleCloseUpdateModal()
    }
  }

  return {
    workspace,
    handleOpenUpdateModal,
    updateModal: {
      data: workspace,
      loading: isSubmitting,
      isOpen: openUpdateModal,
      onClose: handleCloseUpdateModal,
      onSubmit: handleUpdateWorkspace
    }
  }
}
