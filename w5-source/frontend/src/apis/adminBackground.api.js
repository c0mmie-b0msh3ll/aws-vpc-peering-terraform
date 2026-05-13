import { toast } from 'react-toastify'
import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchAdminBackgroundAPI = async ({ search, page, limit }) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/admin/backgrounds`, {
    params: {
      ...(search ? { search } : {}),
      page,
      limit
    }
  })
  return response.data.metadata
}

export const updateBlockBackgroundAPI = async ({ backgroundId }) => {
  const response = await authorizeAxiosInstance.patch(`${API_ROOT}/v1/admin/backgrounds/block/${backgroundId}`)
  toast.success('Background change status successfully!')
  return response.data.metadata
}

export const updateAdminBackgroundAPI = async ({ _id , backgroundData }) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/admin/backgrounds/update/${_id}`, backgroundData)
  toast.success('Admin background updated successfully!')
  return response.data.metadata
}

export const createAdminBackgroundAPI = async ({ backgroundData }) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/admin/backgrounds`, backgroundData)
  toast.success('Admin background created successfully!')
  return response.data.metadata
}

export const deleteAdminBackgroundAPI = async ({ _id }) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/admin/backgrounds/delete/${_id}`)
  toast.success('Admin background deleted successfully!')
  return response.data.metadata
}
