import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

export const fetchWorkspacesAPI = createAsyncThunk(
  'workspaces/fetchWorkspacesAPI',
  async () => {
    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/v1/workspaces`
    )
    return response.data.metadata
  }
)

export const createWorkspaceAPI = createAsyncThunk(
  'workspaces/createWorkspaceAPI',
  async ({ payload }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/v1/workspaces`,
      payload
    )
    return response.data.metadata
  }
)

export const updateWorkspaceAPI = createAsyncThunk(
  'workspaces/updateWorkspaceAPI',
  async ({ _id, payload }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/workspaces/${_id}`,
      payload
    )
    return response.data.metadata
  }
)

export const deleteWorkspaceAPI = createAsyncThunk(
  'workspaces/deleteWorkspaceAPI',
  async ({ _id }) => {
    await authorizeAxiosInstance.delete(`${API_ROOT}/v1/workspaces/${_id}`)
    return _id
  }
)

export const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchWorkspacesAPI.fulfilled, (state, action) => {
      return action.payload
    })

    builder.addCase(createWorkspaceAPI.fulfilled, (state, action) => {
      state.push(action.payload)
    })

    builder.addCase(updateWorkspaceAPI.fulfilled, (state, action) => {
      const updatedWorkspace = action.payload
      return state.map((w) =>
        w._id === updatedWorkspace._id ? updatedWorkspace : w
      )
    })

    builder.addCase(deleteWorkspaceAPI.fulfilled, (state, action) => {
      const _id = action.payload
      return state.filter((w) => w._id !== _id)
    })
  }
})

export const workspacesReducer = workspacesSlice.reducer
