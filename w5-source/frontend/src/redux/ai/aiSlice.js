import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { askDocsBotApi, summarizeWorkspaceApi } from '~/apis/ai.api'

export const askDocsBot = createAsyncThunk(
  'ai/askDocsBot',
  async ({ question, sessionId }, { rejectWithValue }) => {
    try { return await askDocsBotApi(question, sessionId) }
    catch (err) { return rejectWithValue(err.response?.data || { error: err.message }) }
  }
)

export const summarizeWorkspace = createAsyncThunk(
  'ai/summarizeWorkspace',
  async (workspaceId, { rejectWithValue }) => {
    try { return await summarizeWorkspaceApi(workspaceId) }
    catch (err) { return rejectWithValue(err.response?.data || { error: err.message }) }
  }
)

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    chatHistory: [], // [{ role: 'user'|'bot', text, citations?, at }]
    sessionId: null,
    chatLoading: false,
    chatError: null,
    summaryOpen: false,
    summaryData: null, // { summary, generatedAt, cardCount, boardCount }
    summaryLoading: false,
    summaryError: null
  },
  reducers: {
    appendUserMessage: (state, { payload }) => {
      state.chatHistory.push({ role: 'user', text: payload, at: Date.now() })
    },
    resetChat: (state) => {
      state.chatHistory = []
      state.sessionId = null
      state.chatError = null
    },
    openSummary: (state) => {
      state.summaryOpen = true
    },
    closeSummary: (state) => {
      state.summaryOpen = false
      state.summaryData = null
      state.summaryError = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(askDocsBot.pending, (s) => { s.chatLoading = true; s.chatError = null })
      .addCase(askDocsBot.fulfilled, (s, { payload }) => {
        s.chatLoading = false
        s.sessionId = payload?.sessionId || s.sessionId
        s.chatHistory.push({
          role: 'bot',
          text: payload?.answer || '',
          citations: payload?.citations || [],
          at: Date.now()
        })
      })
      .addCase(askDocsBot.rejected, (s, { payload }) => {
        s.chatLoading = false
        s.chatError = payload?.error || payload?.message || 'Lỗi khi gọi AI'
      })
      .addCase(summarizeWorkspace.pending, (s) => {
        s.summaryLoading = true
        s.summaryError = null
        s.summaryData = null
      })
      .addCase(summarizeWorkspace.fulfilled, (s, { payload }) => {
        s.summaryLoading = false
        s.summaryData = payload
      })
      .addCase(summarizeWorkspace.rejected, (s, { payload }) => {
        s.summaryLoading = false
        s.summaryError = payload?.error || payload?.message || 'Lỗi khi tóm tắt'
      })
  }
})

export const {
  appendUserMessage,
  resetChat,
  openSummary,
  closeSummary
} = aiSlice.actions

export const aiReducer = aiSlice.reducer

export const selectAiState = (state) => state.ai
