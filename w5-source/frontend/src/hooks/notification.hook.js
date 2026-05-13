import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchInvitationsAPI,
  updateBoardInvitationAPI,
  updateWorkspaceInvitationAPI
} from '~/redux/notifications/notificationSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useNavigate } from 'react-router-dom'
import { fetchWorkspacesAPI } from '~/redux/workspace/workspacesSlice'

export const useNotification = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const notifications = useSelector((state) => state.notifications)

  const [anchorEl, setAnchorEl] = useState(null)
  const [newNotification, setNewNotification] = useState(false)

  const open = useMemo(() => Boolean(anchorEl), [anchorEl])

  const handleClickNotificationIcon = (event) => {
    setAnchorEl(event.currentTarget)
    setNewNotification(false)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    if (!currentUser?._id) return

    dispatch(fetchInvitationsAPI())
  }, [dispatch, currentUser?._id])

  const handleUpdateNotification = async ({ notification, status }) => {
    const updatedNotification = await dispatch(
      notification.entity === 'workspace'
        ? updateWorkspaceInvitationAPI({
            _id: notification._id,
            payload: { status }
          })
        : updateBoardInvitationAPI({
            _id: notification._id,
            payload: { status }
          })
    ).unwrap()

    if (updatedNotification.status === 'accepted') {
      if (updatedNotification.entity === 'workspace') {
        dispatch(fetchWorkspacesAPI())
        navigate(`/h/workspaces/${updatedNotification.entityId}/boards`)
      }
      if (updatedNotification.entity === 'board') {
        navigate(`/boards/${updatedNotification.entityId}`)
      }
    }
  }

  return {
    anchorEl,
    open,
    notifications,
    newNotification,
    setNewNotification,
    handleClickNotificationIcon,
    handleUpdateNotification,
    handleClose
  }
}
