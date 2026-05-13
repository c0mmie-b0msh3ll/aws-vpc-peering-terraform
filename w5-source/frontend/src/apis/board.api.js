import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchBoardOverviewAPI = async (searchPath) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/boards/overview${searchPath}`
  )
  return response.data.metadata
}

export const fetchBackgroundAPI = async () => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/boards/backgrounds`
  )
  return response.data.metadata
}

export const fetchBoardByWorkspaceIdAPI = async ({ workspaceId }) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/boards/workspace/${workspaceId}`
  )
  return response.data.metadata
}

export const fetchBoardMemberAPI = async ({ _id, search }) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/boards/members/${_id}`,
    { params: search ? { search } : {} }
  )
  return response.data.metadata
}

export const fetchUpdateBoardInfoAPI = async ({ _id, data }) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/boards/${_id}`,
    data
  )
  return {
    message: response.data.message,
    metadata: response.data.metadata
  }
}

export const fetchBoardPermissionAPI = async () => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/boards/permissions`
  )
  return response.data.metadata
}

export const fetchBoardRoleAPI = async ({ _id }) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/boards/roles/${_id}`
  )
  return response.data.metadata
}

export const createBoardRoleAPI = async ({ payload }) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/boards/roles`,
    payload
  )
  return {
    message: response.data.message,
    metadata: response.data.metadata
  }
}

export const updateBoardRoleAPI = async ({ boardId, payload }) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/boards/roles/${boardId}`,
    payload
  )
  return {
    message: response.data.message,
    metadata: response.data.metadata
  }
}

export const deleteBoardRoleAPI = async ({ boardId, roleId }) => {
  const response = await authorizeAxiosInstance.delete(
    `${API_ROOT}/v1/boards/roles/${boardId}/${roleId}`
  )
  return {
    message: response.data.message,
    metadata: response.data.metadata
  }
}

export const updateStatusBoardAPI = async ({ _id, data }) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/boards/status/${_id}`,
    data
  )
  return {
    message: response.data.message,
    metadata: response.data.metadata
  }
}

export const updateBoardMemberRoleAPI = async ({ _id, boardId, payload }) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/boards/members/${boardId}/${_id}`,
    payload
  )
  return response.data.metadata
}

export const removeBoardMemberAPI = async ({ _id, boardId }) => {
  const response = await authorizeAxiosInstance.delete(
    `${API_ROOT}/v1/boards/members/${boardId}/${_id}`
  )
  return response.data.metadata
}

export const leaveBoardAPI = async ({ memberId, boardId }) => {
  const response = await authorizeAxiosInstance.delete(
    `${API_ROOT}/v1/boards/members/leave/${boardId}/${memberId}`
  )
  return response.data.metadata
}

export const fetchBoardActivity = async ({ boardId }) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/boards/activity/${boardId}`
  )
  return response.data.metadata
}

export const fetchArchivedColumnsAPI = async ({ boardId }) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/columns/archived/${boardId}`
  )
  return response.data.metadata
}

export const fetchArchivedCardsAPI = async ({ boardId }) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/cards/archived/${boardId}`
  )
  return response.data.metadata
}

export const archivedColumnAPI = async ({ columnId, boardId }) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/columns/archive/${boardId}/${columnId}`
  )
  return response.data.metadata
}

export const restoreColumnAPI = async ({ columnId, boardId }) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/columns/restore/${boardId}/${columnId}`
  )
  return response.data.metadata
}

export const deleteColumnAPI = async ({ columnId, boardId }) => {
  const response = await authorizeAxiosInstance.delete(
    `${API_ROOT}/v1/columns/${boardId}/${columnId}`
  )
  return response.data.metadata
}
