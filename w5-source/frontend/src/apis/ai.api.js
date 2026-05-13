import axios from 'axios'
import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

const AI_API_URL = import.meta.env.VITE_AI_API_URL
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY

// Separate axios for API Gateway (no cookie, uses Bearer token)
const aiAxios = axios.create({
  baseURL: AI_API_URL,
  timeout: 65000 // summarize can take up to 60s
})

let cachedToken = null
let tokenExpiresAt = 0

async function getAiToken() {
  const now = Date.now()
  // Refresh 30s before expiry to avoid race
  if (cachedToken && now < tokenExpiresAt - 30000) return cachedToken

  const resp = await authorizeAxiosInstance.post(`${API_ROOT}/v1/users/ai-token`)
  const data = resp.data?.metadata || resp.data
  cachedToken = data.token
  const expiresIn = data.expiresIn || 900
  tokenExpiresAt = now + expiresIn * 1000
  return cachedToken
}

async function callAi(method, path, body) {
  if (!AI_API_URL) {
    throw new Error('VITE_AI_API_URL is not configured')
  }
  let token = await getAiToken()
  try {
    const resp = await aiAxios.request({
      method,
      url: path,
      data: body,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(AI_API_KEY ? { 'x-api-key': AI_API_KEY } : {})
      }
    })
    return resp.data
  } catch (err) {
    const status = err.response?.status
    // Retry once on 401 with fresh token
    if (status === 401 || status === 403) {
      cachedToken = null
      token = await getAiToken()
      const resp = await aiAxios.request({
        method,
        url: path,
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(AI_API_KEY ? { 'x-api-key': AI_API_KEY } : {})
        }
      })
      return resp.data
    }
    throw err
  }
}

export const askDocsBotApi = (question, sessionId) =>
  callAi('POST', '/ai/docs/ask', { question, sessionId })

export const summarizeWorkspaceApi = (workspaceId) =>
  callAi('POST', `/ai/workspaces/${workspaceId}/summary`)
