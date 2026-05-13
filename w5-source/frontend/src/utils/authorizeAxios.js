import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from './formatters'
import { refreshTokenAPI } from '~/apis'
import { logoutUserApi } from '~/redux/user/userSlice'

let axiosReduxStore

export const injectStore = (mainStore) => {
  axiosReduxStore = mainStore
}

let authorizeAxiosInstance = axios.create()

authorizeAxiosInstance.defaults.timeout = 1000 * 60 * 10

authorizeAxiosInstance.defaults.withCredentials = true

authorizeAxiosInstance.interceptors.request.use(
  (config) => {
    interceptorLoadingElements(true)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let refreshTokenPromise = null

authorizeAxiosInstance.interceptors.response.use(
  (response) => {
    interceptorLoadingElements(false)
    return response
  },
  (error) => {
    interceptorLoadingElements(false)

    if (error.response?.status === 401) {
      axiosReduxStore.dispatch(logoutUserApi(false))
      return Promise.reject(error)
    }

    const originalRequest = error.config
    if (error.response?.status === 410 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshTokenAPI()
          .then((data) => {
            return data?.accessToken
          })
          .catch(() => {
            axiosReduxStore.dispatch(logoutUserApi(false))
            return Promise.reject(error)
          })
          .finally(() => {
            refreshTokenPromise = null
          })
      }

      return refreshTokenPromise.then(() => {
        return authorizeAxiosInstance(originalRequest)
      })
    }

    if (error.response?.status !== 410) {
      error.response?.data?.message
        ? toast.error(error.response.data.message)
        : toast.error(error.message)
    }
    return Promise.reject(error)
  }
)

export default authorizeAxiosInstance
