import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchUsersAPI = async ({ search }) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/users`, {
    params: search ? { search } : {}
  })
  return response.data.metadata
}


