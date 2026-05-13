import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { API_ROOT } from '~/utils/constants'
import authorizeAxiosInstance from '~/utils/authorizeAxios'

const initialState = {
  currentActiveCard: null,
  isShowModalActiveCard: false
}

export const fetchCardDetailAPI = createAsyncThunk(
  'notifications/fetchCardDetailAPI',
  async ({ _id }) => {
    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/v1/cards/${_id}`
    )
    return response.data.metadata
  }
)

export const updateCardBasicAPI = createAsyncThunk(
  'notifications/updateCardBasicAPI',
  async ({ _id, boardId, payload }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/cards/${boardId}/${_id}`,
      payload
    )
    return response.data.metadata
  }
)

export const archiveCardAPI = createAsyncThunk(
  'notifications/archiveCardAPI',
  async ({ _id, boardId }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/cards/archive/${boardId}/${_id}`
    )
    return response.data.metadata
  }
)

export const restoreCardAPI = createAsyncThunk(
  'notifications/restoreCardAPI',
  async ({ _id, boardId }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/cards/restore/${boardId}/${_id}`
    )
    return response.data.metadata
  }
)

export const deleteCardAPI = createAsyncThunk(
  'notifications/deleteCardAPI',
  async ({ _id, boardId }) => {
    const response = await authorizeAxiosInstance.delete(
      `${API_ROOT}/v1/cards/${boardId}/${_id}`
    )
    return response.data.metadata
  }
)

// ========================== COMMENT ==========================
export const addCardCommentAPI = createAsyncThunk(
  'notifications/addCardCommentAPI',
  async ({ boardId, payload }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/v1/comments/${boardId}`,
      payload
    )
    return response.data.metadata
  }
)

export const deleteCardCommentAPI = createAsyncThunk(
  'notifications/deleteCardCommentAPI',
  async ({ _id, boardId }) => {
    const response = await authorizeAxiosInstance.delete(
      `${API_ROOT}/v1/comments/${boardId}/${_id}`
    )
    return response.data.metadata
  }
)

// ========================== CHECKLIST ==========================
export const createCheckListAPI = createAsyncThunk(
  'notifications/createCheckListAPI',
  async ({ boardId, payload }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/v1/tasks/${boardId}`,
      payload
    )
    return response.data.metadata
  }
)

export const updateCheckListAPI = createAsyncThunk(
  'notifications/updateCheckListAPI',
  async ({ _id, boardId, payload }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/tasks/${boardId}/${_id}`,
      payload
    )
    return response.data.metadata
  }
)

export const deleteCheckListAPI = createAsyncThunk(
  'notifications/deleteCheckListAPI',
  async ({ _id, boardId }) => {
    const response = await authorizeAxiosInstance.delete(
      `${API_ROOT}/v1/tasks/${boardId}/${_id}`
    )
    return response.data.metadata
  }
)

// ========================== MEMBER ==========================
export const joinCardAPI = createAsyncThunk(
  'notifications/joinCardAPI',
  async ({ _id, boardId }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/cards/join/${boardId}/${_id}`
    )
    return response.data.metadata
  }
)

export const leaveCardAPI = createAsyncThunk(
  'notifications/leaveCardAPI',
  async ({ _id, boardId }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/cards/leave/${boardId}/${_id}`
    )
    return response.data.metadata
  }
)

export const assignMemberToCardAPI = createAsyncThunk(
  'notifications/assignMemberToCardAPI',
  async ({ _id, boardId, payload }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/cards/assign-member/${boardId}/${_id}`,
      payload
    )
    return response.data.metadata
  }
)

export const removeMemberFromCardAPI = createAsyncThunk(
  'notifications/removeMemberFromCardAPI',
  async ({ _id, boardId, payload }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/cards/remove-member/${boardId}/${_id}`,
      payload
    )
    return response.data.metadata
  }
)

// ========================== ATTACHMENT ==========================

export const uploadAttachmentAPI = createAsyncThunk(
  'notifications/uploadAttachmentAPI',
  async ({ payload }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/v1/attachments`,
      payload
    )
    return response.data.metadata
  }
)

export const updateAttachmentAPI = createAsyncThunk(
  'notifications/updateAttachmentAPI',
  async ({ _id, boardId, payload }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/attachments/${boardId}/${_id}`,
      payload
    )
    return response.data.metadata
  }
)

export const deleteAttachmentAPI = createAsyncThunk(
  'notifications/deleteAttachmentAPI',
  async ({ _id, boardId }) => {
    const response = await authorizeAxiosInstance.delete(
      `${API_ROOT}/v1/attachments/${boardId}/${_id}`
    )
    return response.data.metadata
  }
)

// ========================== LABEL ==========================
export const updateCardLabelAPI = createAsyncThunk(
  'notifications/updateCardLabelAPI',
  async ({ _id, boardId, payload }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/cards/labels/${boardId}/${_id}`,
      payload
    )
    return response.data.metadata
  }
)

// ========================== AI ASSIST ==========================
export const generateAIAssistAPI = createAsyncThunk(
  'notifications/generateAIAssistAPI',
  async ({ boardId, cardId, userPrompt }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/v1/cards/ai-assist/${boardId}/${cardId}`,
      { userPrompt }
    )
    return response.data.metadata
  }
)

export const applyAIAssistAPI = createAsyncThunk(
  'notifications/applyAIAssistAPI',
  async ({ boardId, cardId, payload }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/v1/cards/ai-assist/${boardId}/${cardId}/apply`,
      payload
    )
    return response.data.metadata
  }
)

// ========================== SLICE ==========================

export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,
  reducers: {
    showModalActiveCard: (state) => {
      state.isShowModalActiveCard = true
    },

    clearAndHideCurrentActiveCard: (state) => {
      state.currentActiveCard = null
      state.isShowModalActiveCard = false
    },

    updateCurrentActiveCard: (state, action) => {
      if (action.payload.cardDetail)
        state.currentActiveCard.cardDetail = action.payload.cardDetail
    },

    addCommentCurrentActiveCard: (state, action) => {
      const currentList = state.currentActiveCard.comments || []
      const existing = currentList.find((c) => c._id === action.payload._id)
      if (existing) return
      state.currentActiveCard.comments = [action.payload, ...currentList]
    },

    removeCommentCurrentActiveCard: (state, action) => {
      const currentList = state.currentActiveCard.comments
      state.currentActiveCard.comments = currentList.filter(
        (c) => c._id !== action.payload._id
      )
    },

    addAttachmentCurrentActiveCard: (state, action) => {
      const currentList = state.currentActiveCard.attachments || []
      const payloadList = Array.isArray(action.payload) ? action.payload : []

      const existingIds = new Set(currentList.map((item) => item._id))

      const newItems = payloadList.filter((item) => !existingIds.has(item._id))

      state.currentActiveCard.attachments = [...newItems, ...currentList]
    },

    updateAttachmentCurrentActiveCard: (state, action) => {
      const currentList = state.currentActiveCard.attachments || []
      const existing = currentList.find((c) => c._id === action.payload._id)
      if (!existing) return
      state.currentActiveCard.attachments = currentList.map((a) =>
        a._id === action.payload._id ? { ...a, ...action.payload } : a
      )
    },

    removeAttachmentCurrentActiveCard: (state, action) => {
      const currentList = state.currentActiveCard.attachments
      state.currentActiveCard.attachments = currentList.filter(
        (c) => c._id !== action.payload._id
      )
    },

    addTaskCurrentActiveCard: (state, action) => {
      const currentList = state.currentActiveCard.checklists || []

      const existsInTree = (tasks, taskId) => {
        for (const task of tasks) {
          if (task._id === taskId) return true
          if (
            task.childTasks?.length &&
            existsInTree(task.childTasks, taskId)
          ) {
            return true
          }
        }
        return false
      }

      if (existsInTree(currentList, action.payload._id)) return

      if (action.payload.parentTaskId) {
        const addToParent = (tasks) => {
          for (const task of tasks) {
            if (task._id === action.payload.parentTaskId) {
              if (!task.childTasks) task.childTasks = []
              task.childTasks.push(action.payload)
              return true
            }

            if (task.childTasks?.length && addToParent(task.childTasks)) {
              return true
            }
          }
          return false
        }

        addToParent(currentList)
      } else {
        state.currentActiveCard.checklists.push(action.payload)
      }
    },

    updateTaskCurrentActiveCard: (state, action) => {
      const updatedTask = action.payload

      if (!updatedTask.parentTaskId) {
        const checklist = state.currentActiveCard.checklists.find(
          (c) => c._id.toString() === updatedTask._id.toString()
        )

        if (checklist) {
          Object.assign(checklist, updatedTask)
        }
      } else {
        const parent = state.currentActiveCard.checklists.find(
          (c) => c._id.toString() === updatedTask.parentTaskId.toString()
        )

        if (parent) {
          const childTask = (parent.childTasks || []).find(
            (t) => t._id.toString() === updatedTask._id.toString()
          )

          if (childTask) {
            Object.assign(childTask, updatedTask)
          }
        }
      }
    },

    removeTaskCurrentActiveCard: (state, action) => {
      const taskId = action.payload?._id?.toString()
      if (!taskId) return

      const removeFromTree = (tasks) => {
        return tasks
          .filter((task) => task._id?.toString() !== taskId)
          .map((task) => ({
            ...task,
            childTasks: task.childTasks?.length
              ? removeFromTree(task.childTasks)
              : task.childTasks
          }))
      }

      state.currentActiveCard.checklists = removeFromTree(
        state.currentActiveCard.checklists || []
      )
    },

    addLogCurrentActiveCard: (state, action) => {
      const currentList = state.currentActiveCard.logs || []
      const existing = currentList.find((c) => c._id === action.payload._id)
      if (existing) return
      state.currentActiveCard.logs = [action.payload, ...currentList]
    }
  },

  extraReducers: (builder) => {
    builder.addCase(fetchCardDetailAPI.fulfilled, (state, action) => {
      state.currentActiveCard = action.payload
    })

    builder.addCase(deleteCardAPI.fulfilled, (state) => {
      state.currentActiveCard = null
      state.isShowModalActiveCard = false
    })

    builder.addCase(updateCardBasicAPI.fulfilled, (state, action) => {
      if (state?.currentActiveCard?.cardDetail) {
        const { card, log } = action.payload
        state.currentActiveCard.cardDetail = card
        if (log)
          state.currentActiveCard.logs = [log, ...state.currentActiveCard.logs]
      }
    })

    builder.addCase(archiveCardAPI.fulfilled, (state, action) => {
      const { card, log } = action.payload
      state.currentActiveCard.cardDetail = card
      state.currentActiveCard.logs = [log, ...state.currentActiveCard.logs]
    })

    builder.addCase(restoreCardAPI.fulfilled, (state, action) => {
      if (!state.currentActiveCard?.cardDetail) return
      const { card, log } = action.payload
      state.currentActiveCard.cardDetail = card
      state.currentActiveCard.logs = [log, ...state.currentActiveCard.logs]
    })
    // ========================== COMMENT ==========================
    builder.addCase(addCardCommentAPI.fulfilled, (state, action) => {
      const { comment, log } = action.payload
      const currentList = state.currentActiveCard.comments || []
      if (currentList.find((c) => c._id === comment._id)) return
      state.currentActiveCard.comments = [comment, ...currentList]
      if (log)
        state.currentActiveCard.logs = [log, ...state.currentActiveCard.logs]
    })

    builder.addCase(deleteCardCommentAPI.fulfilled, (state, action) => {
      const { comment, log } = action.payload
      const currentList = state.currentActiveCard.comments
      state.currentActiveCard.comments = currentList.filter(
        (c) => c._id !== comment._id
      )
      if (log)
        state.currentActiveCard.logs = [log, ...state.currentActiveCard.logs]
    })

    // ========================== CHECKLIST ==========================
    builder.addCase(createCheckListAPI.fulfilled, (state, action) => {
      if (!state.currentActiveCard) return

      const { task: incoming, log } = action.payload
      if (!incoming) return

      const currentChecklists = state.currentActiveCard.checklists || []

      const existsInTree = (tasks, taskId) => {
        for (const task of tasks) {
          if (task._id?.toString() === taskId?.toString()) return true
          if (
            task.childTasks?.length &&
            existsInTree(task.childTasks, taskId)
          ) {
            return true
          }
        }
        return false
      }

      if (!existsInTree(currentChecklists, incoming._id)) {
        if (incoming.parentTaskId) {
          const parentTask = currentChecklists.find(
            (t) => t._id?.toString() === incoming.parentTaskId?.toString()
          )

          if (parentTask) {
            if (!parentTask.childTasks) parentTask.childTasks = []

            const childExists = parentTask.childTasks.some(
              (t) => t._id?.toString() === incoming._id?.toString()
            )

            if (!childExists) {
              parentTask.childTasks.push(incoming)
            }
          }
        } else {
          currentChecklists.push(incoming)
        }
      }

      if (
        log &&
        !state.currentActiveCard.logs?.find((item) => item._id === log._id)
      ) {
        const currentLogs = state.currentActiveCard.logs || []
        const existingLog = currentLogs.find((item) => item._id === log._id)

        if (!existingLog) {
          state.currentActiveCard.logs = [log, ...currentLogs]
        }
      }
    })

    builder.addCase(updateCheckListAPI.fulfilled, (state, action) => {
      const updatedTask = action.payload.task

      if (!updatedTask.parentTaskId) {
        const checklist = state.currentActiveCard.checklists.find(
          (c) => c._id.toString() === updatedTask._id.toString()
        )

        if (checklist) {
          Object.assign(checklist, updatedTask)
        }
      } else {
        const parent = state.currentActiveCard.checklists.find(
          (c) => c._id.toString() === updatedTask.parentTaskId.toString()
        )

        if (parent) {
          const childTask = (parent.childTasks || []).find(
            (t) => t._id.toString() === updatedTask._id.toString()
          )

          if (childTask) {
            Object.assign(childTask, updatedTask)
          }
        }
      }
    })

    builder.addCase(deleteCheckListAPI.fulfilled, (state, action) => {
      if (!state.currentActiveCard) return

      const { task: deletingTask, log } = action.payload
      if (!deletingTask) return

      if (!deletingTask.parentTaskId) {
        state.currentActiveCard.checklists =
          state.currentActiveCard.checklists.filter(
            (c) => c._id.toString() !== deletingTask._id.toString()
          )
      } else {
        const parent = state.currentActiveCard.checklists.find(
          (c) => c._id.toString() === deletingTask.parentTaskId.toString()
        )

        if (parent) {
          parent.childTasks = (parent.childTasks || []).filter(
            (t) => t._id.toString() !== deletingTask._id.toString()
          )
        }
      }

      if (
        log &&
        !state.currentActiveCard.logs?.find((item) => item._id === log._id)
      ) {
        const currentLogs = state.currentActiveCard.logs || []
        const existingLog = currentLogs.find((item) => item._id === log._id)

        if (!existingLog) {
          state.currentActiveCard.logs = [log, ...currentLogs]
        }
      }
    })

    // ========================== MEMBER ==========================
    builder.addCase(joinCardAPI.fulfilled, (state, action) => {
      const { card, log } = action.payload
      state.currentActiveCard.cardDetail = card
      state.currentActiveCard.logs = [log, ...state.currentActiveCard.logs]
    })

    builder.addCase(leaveCardAPI.fulfilled, (state, action) => {
      const { card, log } = action.payload
      state.currentActiveCard.cardDetail = card
      state.currentActiveCard.logs = [log, ...state.currentActiveCard.logs]
    })

    builder.addCase(assignMemberToCardAPI.fulfilled, (state, action) => {
      const { card, log } = action.payload
      state.currentActiveCard.cardDetail = card
      state.currentActiveCard.logs = [log, ...state.currentActiveCard.logs]
    })

    builder.addCase(removeMemberFromCardAPI.fulfilled, (state, action) => {
      const { card, log } = action.payload
      state.currentActiveCard.cardDetail = card
      state.currentActiveCard.logs = [log, ...state.currentActiveCard.logs]
    })

    // ========================== ATTACHMENT ==========================
    builder.addCase(uploadAttachmentAPI.fulfilled, (state, action) => {
      if (!state.currentActiveCard) return

      const { attachments: incomingAttachments = [], log } = action.payload
      const currentAttachments = state.currentActiveCard.attachments || []

      if (!incomingAttachments.length) return

      const existingIds = new Set(currentAttachments.map((item) => item._id))

      const newAttachments = incomingAttachments.filter(
        (item) => !existingIds.has(item._id)
      )

      if (newAttachments.length) {
        state.currentActiveCard.attachments = [
          ...newAttachments,
          ...currentAttachments
        ]
      }

      if (
        log &&
        !state.currentActiveCard.logs?.find((item) => item._id === log._id)
      ) {
        const currentLogs = state.currentActiveCard.logs || []
        const existingLog = currentLogs.find((item) => item._id === log._id)

        if (!existingLog) {
          state.currentActiveCard.logs = [log, ...currentLogs]
        }
      }
    })

    builder.addCase(updateAttachmentAPI.fulfilled, (state, action) => {
      const updatedAttachment = action.payload
      const currentAttachments = state.currentActiveCard.attachments
      state.currentActiveCard.attachments = currentAttachments.map((a) =>
        a._id === updatedAttachment._id ? updatedAttachment : a
      )
    })

    builder.addCase(deleteAttachmentAPI.fulfilled, (state, action) => {
      if (!state.currentActiveCard) return

      const { _id: idDeletedAttachment, log } = action.payload
      const currentAttachments = state.currentActiveCard.attachments || []

      state.currentActiveCard.attachments = currentAttachments.filter(
        (a) => a._id !== idDeletedAttachment
      )

      if (
        log &&
        !state.currentActiveCard.logs?.find((item) => item._id === log._id)
      ) {
        state.currentActiveCard.logs = [
          log,
          ...(state.currentActiveCard.logs || [])
        ]
      }
    })
    // ========================== AI ASSIST ==========================
    builder.addCase(applyAIAssistAPI.fulfilled, (state, action) => {
      if (!state.currentActiveCard) return
      const { card, tasks } = action.payload

      state.currentActiveCard.cardDetail = card

      if (tasks && tasks.length > 0) {
        const parentTaskId = tasks[0].parentTaskId
        const parentTask = {
          _id: parentTaskId,
          cardId: card._id,
          content: 'AI Generated Tasks',
          parentTaskId: null,
          childTasks: tasks
        }
        state.currentActiveCard.checklists.push(parentTask)
      }
    })

    // ========================== LABELS ==========================
    builder.addCase(updateCardLabelAPI.fulfilled, (state, action) => {
      state.currentActiveCard.cardDetail = action.payload
    })
  }
})

export const {
  clearAndHideCurrentActiveCard,
  showModalActiveCard,
  updateCurrentActiveCard,
  addCommentCurrentActiveCard,
  removeCommentCurrentActiveCard,
  addLogCurrentActiveCard,
  addAttachmentCurrentActiveCard,
  updateAttachmentCurrentActiveCard,
  removeAttachmentCurrentActiveCard,
  addTaskCurrentActiveCard,
  updateTaskCurrentActiveCard,
  removeTaskCurrentActiveCard
} = activeCardSlice.actions

export const selectIsShowModalActiveCard = (state) => {
  return state.activeCard.isShowModalActiveCard
}

export const activeCardReducer = activeCardSlice.reducer
