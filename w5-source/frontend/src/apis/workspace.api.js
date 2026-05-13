import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchWorkspaceInfoAPI = async ({ _id }) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/workspaces/${_id}`
  )
  return response.data.metadata
}

export const fetchWorkspaceMemberAPI = async ({ _id, search }) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/workspaces/members/${_id}`,
    { params: search ? { search } : {} }
  )
  return response.data.metadata
}

export const fetchWorkspacePermissionAPI = async () => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/workspaces/permissions`
  )
  return response.data.metadata
}

export const fetchWorkspaceRoleAPI = async ({ _id }) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/workspaces/roles/${_id}`
  )
  return response.data.metadata
}

export const createWorkspaceRoleAPI = async ({ payload }) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/workspaces/roles`,
    payload
  )
  return response.data.metadata
}

export const updateWorkspaceRoleAPI = async ({ workspaceId, payload }) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/workspaces/roles/${workspaceId}`,
    payload
  )
  return response.data.metadata
}

export const deleteWorkspaceRoleAPI = async ({ workspaceId, roleId }) => {
  const response = await authorizeAxiosInstance.delete(
    `${API_ROOT}/v1/workspaces/roles/${workspaceId}/${roleId}`
  )
  return response.data.metadata
}

export const updateWorkspaceMemberRoleAPI = async ({
  workspaceId,
  memberId,
  payload
}) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/workspaces/members/${workspaceId}/${memberId}`,
    payload
  )
  return response.data.metadata
}

export const leaveWorkspaceAPI = async ({ memberId }) => {
  const response = await authorizeAxiosInstance.delete(
    `${API_ROOT}/v1/workspaces/members/leave/${memberId}`
  )
  return response.data.metadata
}

export const removeWorkspaceMemberAPI = async ({ workspaceId, memberId }) => {
  const response = await authorizeAxiosInstance.delete(
    `${API_ROOT}/v1/workspaces/members/${workspaceId}/${memberId}`
  )
  return response.data.metadata
}

export const createWorkspaceExportAPI = async ({ workspaceId }) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/workspaces/${workspaceId}/exports`
  )
  return response.data.metadata
}

export const downloadWorkspaceExportAPI = async ({ downloadPath }) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}${downloadPath}`,
    { responseType: 'blob' }
  )

  return response.data
}
