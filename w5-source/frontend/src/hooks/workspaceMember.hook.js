import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { inviteUserToWorkspaceAPI } from '~/apis/invitation.api'
import { fetchUsersAPI } from '~/apis/user.api'
import {
  fetchWorkspaceMemberAPI,
  fetchWorkspaceRoleAPI,
  leaveWorkspaceAPI,
  removeWorkspaceMemberAPI,
  updateWorkspaceMemberRoleAPI
} from '~/apis/workspace.api'
import { useDebounceFn } from '~/customHooks/useDebounceFn'
import { fetchWorkspacesAPI } from '~/redux/workspace/workspacesSlice'

export const useWorkspaceMember = () => {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [members, setMembers] = useState([])
  const [roles, setRoles] = useState([])
  const [inviteCandidates, setInviteCandidates] = useState([])

  const [memberKeyword, setMemberKeyword] = useState('')
  const [inviteKeyword, setInviteKeyword] = useState('')

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)

  const fetchWorkspaceMembers = useCallback(
    async (keyword = '') => {
      if (!workspaceId) return

      const data = await fetchWorkspaceMemberAPI({
        _id: workspaceId,
        search: keyword
      })

      setMembers(data || [])
    },
    [workspaceId]
  )

  const fetchInviteCandidates = useCallback(async (keyword = '') => {
    const data = await fetchUsersAPI({
      search: keyword
    })

    setInviteCandidates(data || [])
  }, [])

  const debounceFetchWorkspaceMembers = useDebounceFn(
    fetchWorkspaceMembers,
    500
  )

  const debounceFetchInviteCandidates = useDebounceFn(
    fetchInviteCandidates,
    500
  )

  const fetchWorkspaceRole = async () => {
    const data = await fetchWorkspaceRoleAPI({ _id: workspaceId })
    setRoles(data)
  }

  useEffect(() => {
    fetchWorkspaceMembers('')
    fetchWorkspaceRole()
  }, [fetchWorkspaceMembers])

  const handleMemberSearchChange = useCallback(
    (event) => {
      const value = event.target.value || ''
      setMemberKeyword(value)
      debounceFetchWorkspaceMembers(value)
    },
    [debounceFetchWorkspaceMembers]
  )

  const handleInviteSearchChange = useCallback(
    (value = '') => {
      setInviteKeyword(value)
      if (value.trim().length < 3) return
      debounceFetchInviteCandidates(value.trim())
    },
    [debounceFetchInviteCandidates]
  )

  const handleOpenInviteModal = () => setIsInviteModalOpen(true)

  const handleCloseInviteModal = useCallback(() => {
    if (isInviting) return
    setIsInviteModalOpen(false)
    setInviteKeyword('')
    setInviteCandidates([])
  }, [])

  const handleInvite = useCallback(
    async (data) => {
      try {
        setIsInviting(true)
        await inviteUserToWorkspaceAPI({ payload: { workspaceId, ...data } })
        handleCloseInviteModal()
        await fetchWorkspaceMembers(memberKeyword)
      } finally {
        setIsInviting(false)
      }
    },
    [fetchWorkspaceMembers, handleCloseInviteModal, memberKeyword]
  )

  const handleChangeMemberRole = async ({ _id, newRole }) => {
    const data = await updateWorkspaceMemberRoleAPI({
      workspaceId,
      memberId: _id,
      payload: { roleId: newRole }
    })

    setMembers((prev) =>
      prev.map((m) => {
        if (m._id === data._id) return { ...m, ...data }
        return m
      })
    )
  }

  const handleLeaveWorkspace = async ({ memberId }) => {
    await leaveWorkspaceAPI({ memberId })
    dispatch(fetchWorkspacesAPI())
    navigate('/h')
  }

  const handleRemoveMember = async ({ memberId }) => {
    const data = await removeWorkspaceMemberAPI({ workspaceId, memberId })
    setMembers((prev) =>
      prev.map((m) => {
        if (m._id === data._id) return { ...m, ...data }
        return m
      })
    )
  }

  return {
    members,
    roles,
    memberKeyword,
    handleMemberSearchChange,
    handleOpenInviteModal,
    handleChangeMemberRole,
    handleLeaveWorkspace,
    handleRemoveMember,
    inviteModal: {
      users: inviteCandidates,
      searchKeyword: inviteKeyword,
      isOpen: isInviteModalOpen,
      loading: isInviting,
      onClose: handleCloseInviteModal,
      onSubmit: handleInvite,
      onSearchChange: handleInviteSearchChange
    }
  }
}
