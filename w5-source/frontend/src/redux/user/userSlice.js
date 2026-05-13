import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

const initialState = {
  currentUser: null
}

export const loginUserApi = createAsyncThunk(
  'user/loginUserApi',
  async (data) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/v1/users/login`,
      data
    )
    return response.data.metadata
  }
)

export const logoutUserApi = createAsyncThunk(
  'user/logoutUserApi',
  async (showSuccessMessage = true) => {
    const response = await authorizeAxiosInstance.delete(
      `${API_ROOT}/v1/users/logout`
    )
    if (showSuccessMessage) {
      toast.success('Logged out successfully!')
    }
    return response.data.metadata
  }
)

export const updateUserAPI = createAsyncThunk(
  'user/updateUserAPI',
  async (data) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/users/update`,
      data
    )
    return response.data.metadata
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loginUserApi.fulfilled, (state, action) => {
      state.currentUser = action.payload
    })

    builder.addCase(logoutUserApi.fulfilled, (state) => {
      state.currentUser = null
    })

    builder.addCase(updateUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
  }
})

export const selectCurrentUser = (state) => {
  return state.user.currentUser
}

export const userReducer = userSlice.reducer
