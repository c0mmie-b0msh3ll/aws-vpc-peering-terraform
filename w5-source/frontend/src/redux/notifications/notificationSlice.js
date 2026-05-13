import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchInvitationsAPI = createAsyncThunk(
  'notifications/fetchInvitationsAPI',
  async () => {
    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/v1/invitations`
    )
    return response.data.metadata
  }
)

export const updateWorkspaceInvitationAPI = createAsyncThunk(
  'notifications/updateWorkspaceInvitationAPI',
  async ({ _id, payload }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/invitations/workspace/${_id}`,
      payload
    )
    return response.data.metadata
  }
)

export const updateBoardInvitationAPI = createAsyncThunk(
  'notifications/updateBoardInvitationAPI',
  async ({ _id, payload }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/invitations/board/${_id}`,
      payload
    )
    return response.data.metadata
  }
)

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: [],
  reducers: {
    clearNotifications: (state) => {
      state.notifications = null
    },
    updateNotifications: (state, action) => {
      state.notifications = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchInvitationsAPI.fulfilled, (state, action) => {
      return action.payload
    })

    builder.addCase(updateWorkspaceInvitationAPI.fulfilled, (state, action) => {
      const updatedNotification = action.payload
      return state.map((n) =>
        n._id === updatedNotification._id
          ? { ...n, status: updatedNotification.status }
          : n
      )
    })
  }
})

export const { clearNotifications, updateNotifications, addNotification } =
  notificationsSlice.actions

export const notificationsReducer = notificationsSlice.reducer
