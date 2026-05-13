import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { mapOrder } from '~/utils/sorts'
import { isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

const initialState = {
  board: null,
  members: [],
  labels: [],
  isDenied: false
}

export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await authorizeAxiosInstance.get(
        `${API_ROOT}/v1/boards/${boardId}`
      )
      return response.data.metadata
    } catch (error) {
      return rejectWithValue({
        status: error?.response?.status,
        message: error?.response?.data?.message || error.message
      })
    }
  }
)

export const createLabelAPI = createAsyncThunk(
  'activeBoard/createLabelAPI',
  async ({ payload }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/v1/labels`,
      payload
    )
    return response.data.metadata
  }
)

export const updateLabelAPI = createAsyncThunk(
  'activeBoard/updateLabelAPI',
  async ({ _id, boardId, payload }) => {
    const response = await authorizeAxiosInstance.put(
      `${API_ROOT}/v1/labels/${boardId}/${_id}`,
      payload
    )
    return response.data.metadata
  }
)

export const deleteLabelAPI = createAsyncThunk(
  'activeBoard/deleteLabelAPI',
  async ({ _id, boardId }) => {
    const response = await authorizeAxiosInstance.delete(
      `${API_ROOT}/v1/labels/${boardId}/${_id}`
    )
    return response.data.metadata
  }
)

export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      state.board = action.payload
    },

    updateCardInBoard: (state, action) => {
      const inComingCard = action.payload
      const column = state.board.columns.find(
        (i) => i._id === inComingCard.columnId
      )
      if (column) {
        const card = column.cards.find((i) => i._id === inComingCard._id)
        if (card) {
          Object.keys(inComingCard).forEach((key) => {
            card[key] = inComingCard[key]
          })
        }
      }
    },

    removeCardInBoard: (state, action) => {
      const removingCard = action.payload

      const column = state.board.columns.find(
        (i) => i._id === removingCard.columnId
      )

      if (column) {
        column.cards = column.cards.filter((i) => i._id !== removingCard._id)
        column.cardOrderIds = column.cardOrderIds.filter(
          (id) => id !== removingCard._id
        )
      }
    },

    restoreCardInBoard: (state, action) => {
      const restoringCard = action.payload

      const column = state.board.columns.find(
        (i) => i._id === restoringCard.columnId
      )

      if (column) {
        column.cards.push(restoringCard)
        column.cardOrderIds.push(restoringCard._id)
      }
    },

    restoreColumnInBoard: (state, action) => {
      const restoringColumn = action.payload

      if (!restoringColumn) return

      const existedColumn = state.board.columns.find(
        (item) => item._id === restoringColumn._id
      )

      if (existedColumn) return

      state.board.columns.push(restoringColumn)
      state.board.columnOrderIds.push(restoringColumn._id)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.pending, (state) => {
      state.isDenied = false
    })

    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      const { board, members, labels } = action.payload
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')
      board.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })
      state.board = board
      state.members = members
      state.labels = labels
      state.isDenied = false
    })

    builder.addCase(fetchBoardDetailsAPI.rejected, (state, action) => {
      state.board = null
      state.members = []
      state.labels = []
      state.isDenied = action.payload?.status === 403
    })

    // ============================= LABELS =============================
    builder.addCase(createLabelAPI.fulfilled, (state, action) => {
      const createdLabel = action.payload
      const currentLabel = state.labels
      state.labels = [createdLabel, ...currentLabel]
    })

    builder.addCase(updateLabelAPI.fulfilled, (state, action) => {
      const updatedLabel = action.payload
      const currentLabel = state.labels
      state.labels = currentLabel?.map((l) =>
        l._id === updatedLabel._id ? updatedLabel : l
      )
    })

    builder.addCase(deleteLabelAPI.fulfilled, (state, action) => {
      const deletedLabelId = action.payload._id?.toString()

      state.labels = (state.labels || []).filter(
        (label) => label._id?.toString() !== deletedLabelId
      )

      state.columns = (state.columns || []).map((column) => ({
        ...column,
        cards: (column.cards || []).map((card) => ({
          ...card,
          labelIds: (card.labelIds || []).filter(
            (labelId) => labelId?.toString() !== deletedLabelId
          )
        }))
      }))
    })
  }
})

// Actions
export const {
  updateCurrentActiveBoard,
  updateCardInBoard,
  removeCardInBoard,
  restoreCardInBoard,
  restoreColumnInBoard
} = activeBoardSlice.actions

export const activeBoardReducer = activeBoardSlice.reducer
