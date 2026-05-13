import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'react-toastify'

export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/boards/${boardId}`,
    updateData
  )
  return response.data.metadata
}

export const moveCardToDifferentColumnAPI = async ({ updateData, boardId }) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/boards/supports/moving_card/${boardId}`,
    updateData
  )
  return response.data.metadata
}

/** Columns */
export const createNewColumnAPI = async (newColumnData) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/columns`,
    newColumnData
  )
  return response.data.metadata
}

export const updateColumnDetailsAPI = async ({
  boardId,
  columnId,
  payload
}) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/columns/${boardId}/${columnId}`,
    payload
  )
  return response.data.metadata
}

export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await authorizeAxiosInstance.delete(
    `${API_ROOT}/v1/columns/${columnId}`
  )
  return response.data.metadata
}

/** Cards */
export const createNewCardAPI = async (newCardData) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/cards`,
    newCardData
  )
  return response.data.metadata
}

/** Users */
export const registerUserAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/users/register`,
    data
  )
  toast.success(
    'Account created successfully! Please check and verify your account before logging in!'
  )
  return response.data.metadata
}

export const verifyUserAPI = async (data) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/users/verify`,
    data
  )
  toast.success(
    'Account verified successfully! Now you can login to enjoy our services! Have a good day!'
  )
  return response.data.metadata
}

export const refreshTokenAPI = async () => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/users/refresh_token`
  )
  return response.data.metadata
}

export const fetchBoardsAPI = async (searchPath) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/boards${searchPath}`
  )

  return response.data.metadata
}

export const createNewBoardsAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/boards`,
    data
  )

  toast.success('Broad created successfully!')
  return response.data.metadata
}

export const updateCardDetailsAPI = async (cardId, updateData) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/cards/${cardId}`,
    updateData
  )
  return response.data.metadata
}

export const inviteUserToBoardAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/invitations/board`,
    data
  )
  toast.success('User invited to board successfully!')
  return response.data
}

export const FogotPasswordAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/users/forgot_password`,
    data
  )
  toast.success('Recovery link sent successfully! Please check your email!')
  return response.data
}

export const ChangePassWordAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/users/change_password`,
    data
  )
  toast.success('Password changed successfully!')
  return response.data
}

export const verifyResetPasswordToken = async (data) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/users/verify_reset_password_token`,
    data
  )
  return response.data
}

export const aiGenerateBoardAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/boards/ai-generate`,
    data
  )

  toast.success('AI board generated successfully!')
  return response.data.metadata
}
