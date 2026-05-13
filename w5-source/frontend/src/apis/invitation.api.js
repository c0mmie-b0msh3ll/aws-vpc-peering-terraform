import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const inviteUserToWorkspaceAPI = async ({ payload }) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/invitations/workspace`,
    payload
  )
  return response.data.metadata
}

export const inviteUserToBoardAPI = async ({ payload }) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/invitations/board`,
    payload
  )
  return response.data.metadata
}
