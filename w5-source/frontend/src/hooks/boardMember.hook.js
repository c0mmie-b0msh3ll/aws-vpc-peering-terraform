import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchBoardMemberAPI,
  fetchBoardRoleAPI,
  leaveBoardAPI,
  removeBoardMemberAPI,
  updateBoardMemberRoleAPI
} from '~/apis/board.api'
import { fetchWorkspaceMemberAPI } from '~/apis/workspace.api'
import { useDebounceFn } from '~/customHooks/useDebounceFn'
import { inviteUserToBoardAPI } from '~/apis/invitation.api'
import { useSelector } from 'react-redux'

export const useBoardMember = () => {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteCandidates, setInviteCandidates] = useState([])

  const [memberKeyword, setMemberKeyword] = useState('')
  const [inviteKeyword, setInviteKeyword] = useState('')

  const [isInviting, setIsInviting] = useState(false)
  const [roles, setRoles] = useState([])

  const { boardId } = useParams()
  const board = useSelector((state) => state.activeBoard.board)

  const navigate = useNavigate()

  const fetchBoardMembers = useCallback(
    async (searchValue = '') => {
      if (!boardId) return
      const data = await fetchBoardMemberAPI({
        _id: boardId,
        search: searchValue
      })

      setMembers(data)
    },
    [boardId]
  )

  const fetchBoardRole = async () => {
    const data = await fetchBoardRoleAPI({ _id: boardId })
    setRoles(data)
  }

  const debouncefetchBoardMembers = useDebounceFn(fetchBoardMembers, 500)

  useEffect(() => {
    fetchBoardMembers('')
    fetchBoardRole()
  }, [fetchBoardMembers])

  const handleInputSearchChange = useCallback(
    (event) => {
      const value = event.target.value || ''
      setSearch(value)
      debouncefetchBoardMembers(value)
    },
    [debouncefetchBoardMembers]
  )
  const fetchInviteCandidates = useCallback(
    async (keyword = '') => {
      if (!board?.workspaceId) return

      const data = await fetchWorkspaceMemberAPI({
        _id: board.workspaceId,
        search: keyword
      })

      setInviteCandidates(data || [])
    },
    [board?.workspaceId]
  )

  const handleOpenInviteModal = () => setIsInviteModalOpen(true)

  const handleCloseInviteModal = useCallback(() => {
    if (isInviting) return
    setIsInviteModalOpen(false)
    setInviteKeyword('')
    setInviteCandidates([])
  }, [])

  const debounceFetchInviteCandidates = useDebounceFn(
    fetchInviteCandidates,
    500
  )

  const handleInviteSearchChange = useCallback(
    (value = '') => {
      setInviteKeyword(value)
      if (value.trim().length < 3) return
      debounceFetchInviteCandidates(value.trim())
    },
    [debounceFetchInviteCandidates]
  )

  const handleInvite = useCallback(
    async (data) => {
      try {
        setIsInviting(true)
        await inviteUserToBoardAPI({ payload: { boardId, ...data } })
        handleCloseInviteModal()
        await fetchBoardMemberAPI(memberKeyword)
      } finally {
        setIsInviting(false)
      }
    },
    [fetchBoardMemberAPI, handleCloseInviteModal, memberKeyword]
  )

  const handleChangeMemberRole = async ({ _id, newRole }) => {
    const data = await updateBoardMemberRoleAPI({
      _id,
      boardId,
      payload: { roleId: newRole }
    })

    setMembers((prev) =>
      prev.map((m) => {
        if (m._id === data._id) return { ...m, ...data }
        return m
      })
    )
  }

  const handleRemoveMember = async ({ memberId }) => {
    const data = await removeBoardMemberAPI({ _id: memberId, boardId })
    setMembers((prev) =>
      prev.map((m) => {
        if (m._id === data._id) return { ...m, ...data }
        return m
      })
    )
  }

  const handleLeaveBoard = async ({ memberId }) => {
    await leaveBoardAPI({ memberId, boardId })
    navigate(`/h/workspaces/${board?.workspaceId}/boards`)
  }

  return {
    members,
    search,
    handleInputSearchChange,
    handleOpenInviteModal,
    handleChangeMemberRole,
    handleRemoveMember,
    handleLeaveBoard,
    roles,
    inviteModal: {
      isOpen: isInviteModalOpen,
      users: inviteCandidates,
      searchKeyword: inviteKeyword,
      loading: isInviting,
      onClose: handleCloseInviteModal,
      onSubmit: handleInvite,
      onSearchChange: handleInviteSearchChange
    }
  }
}
