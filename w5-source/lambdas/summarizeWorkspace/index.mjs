import {
  BedrockRuntimeClient,
  ConverseCommand
} from '@aws-sdk/client-bedrock-runtime'
import { fetchWorkspaceBundle as _fetchWorkspaceBundle } from './lib/mongo.mjs'
import { formatWorkspace } from './lib/workspaceFormatter.mjs'

const REGION = process.env.AWS_REGION || 'us-east-1'

export const __deps = {
  bedrockClient: new BedrockRuntimeClient({ region: REGION }),
  fetchWorkspaceBundle: _fetchWorkspaceBundle
}

const SYSTEM_PROMPT = `You are a project summarization assistant for TaskIO (Trello-like task management app).
Analyze the workspace data provided in the user message and produce a concise summary covering:
1. Overview (workspace name + description if any, total boards/cards/members)
2. Progress breakdown (done vs pending counts and approximate percentages; use isCompleted flag or DONE tag)
3. Overdue or soon-to-be-overdue cards (list items tagged OVERDUE or DUE SOON; include card title and due date)
4. Blockers, risks, or notable highlights inferred from card titles/descriptions and column names

OUTPUT LANGUAGE: Vietnamese (có dấu).
FORMAT: Markdown with H2 sections (## Tổng quan, ## Tiến độ, ## Cards quá hạn, ## Nhận xét).
LENGTH: ~250 words total.
TONE: Professional but friendly, suitable for Vietnamese team lead reading.
NO EMOJIS: Do not use emojis, icons, or pictographs anywhere. Use plain text markers like [DONE], [OVERDUE], [DUE SOON] or bold text for emphasis.
Do NOT invent data not present in the input. If a section has no relevant info, skip it or write "Không có dữ liệu đáng chú ý."`

function resp(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}

export async function handler(event) {
  try {
    const workspaceId = event.pathParameters?.workspaceId
    const userId =
      event.requestContext?.authorizer?.lambda?.userId ||
      event.requestContext?.authorizer?.userId
    if (!workspaceId) return resp(400, { error: 'workspaceId required' })
    if (!userId) return resp(401, { error: 'userId missing from authorizer' })

    const bundle = await __deps.fetchWorkspaceBundle(workspaceId, userId)
    if (!bundle) return resp(404, { error: 'Workspace not found' })
    if (bundle.forbidden) return resp(403, { error: 'Not a member of this workspace' })

    let markdown
    try {
      markdown = formatWorkspace(bundle)
    } catch (err) {
      if (err.message.includes('hard limit')) {
        return resp(413, { error: err.message })
      }
      throw err
    }

    const converseResp = await __deps.bedrockClient.send(new ConverseCommand({
      modelId: process.env.MODEL_ARN,
      system: [{ text: SYSTEM_PROMPT }],
      messages: [{ role: 'user', content: [{ text: markdown }] }],
      inferenceConfig: { maxTokens: 800, temperature: 0.4 }
    }))

    const summary = converseResp.output?.message?.content?.[0]?.text || ''

    return resp(200, {
      summary,
      generatedAt: new Date().toISOString(),
      cardCount: bundle.cards.length,
      boardCount: bundle.boards.length
    })
  } catch (err) {
    console.error('summarizeWorkspace error:', err)
    return resp(500, { error: 'Internal error' })
  }
}
