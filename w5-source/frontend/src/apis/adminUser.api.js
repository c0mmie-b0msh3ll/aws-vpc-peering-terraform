import { toast } from 'react-toastify'
import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchAdminUsersAPI = async ({ search, page, limit }) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/admin/users`, {
    params: {
      ...(search ? { search } : {}),
      page,
      limit
    }
  })
  return response.data.metadata
}

export const updateBlockUserAPI = async ({ userId }) => {
  const response = await authorizeAxiosInstance.patch(`${API_ROOT}/v1/admin/users/block/${userId}`)
  toast.success('User change status successfully!')
  return response.data.metadata
}

export const updateAdminUserApi = async ({ userId, userData }) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/admin/users/${userId}`, userData)
  toast.success('User updated successfully!')
  return response.data.metadata
}

export const createAdminAccountAPI = async ({ userData }) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/admin/users`, userData)
  toast.success('Admin account created successfully!')
  return response.data.metadata
}
