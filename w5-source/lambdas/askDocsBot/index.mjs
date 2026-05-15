import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand
} from '@aws-sdk/client-bedrock-agent-runtime'

const REGION = process.env.AWS_REGION || 'us-west-2'

// Dependency container - tests mutate __deps.bedrockClient
export const __deps = {
  bedrockClient: new BedrockAgentRuntimeClient({ region: REGION })
}

// Expand casual Vietnamese shortcuts so retrieval embedding matches docs
const SHORTCUT_MAP = {
  'mk': 'mật khẩu',
  'mem': 'member',
  'ws': 'workspace',
  'j': 'gì',
  'k': 'không',
  'đc': 'được',
  'dc': 'được',
  'ntn': 'như thế nào'
}

function normalizeQuery(q) {
  return q.replace(/\b(mk|mem|ws|j|k|đc|dc|ntn)\b/gi, m => SHORTCUT_MAP[m.toLowerCase()] || m)
}

function stripEmojis(text) {
  return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu, '')
}

function resp(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://nguyenductien.cloud',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key'
    },
    body: JSON.stringify(body)
  }
}

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || '{}')
    const rawQuestion = (body.question || '').trim()
    const sessionId = body.sessionId

    if (!rawQuestion) return resp(400, { error: 'question is required' })

    const question = normalizeQuery(rawQuestion)

    const input = {
      input: { text: question },
      retrieveAndGenerateConfiguration: {
        type: 'KNOWLEDGE_BASE',
        knowledgeBaseConfiguration: {
          knowledgeBaseId: process.env.KB_ID,
          modelArn: process.env.MODEL_ARN
        }
      }
    }
    if (sessionId) input.sessionId = sessionId

    const result = await __deps.bedrockClient.send(new RetrieveAndGenerateCommand(input))

    const citations = (result.citations || []).flatMap(c =>
      (c.retrievedReferences || []).map(ref => ({
        source: ref.location?.s3Location?.uri || 'unknown',
        content: ref.content?.text?.slice(0, 200) || ''
      }))
    )

    return resp(200, {
      answer: stripEmojis(result.output?.text || ''),
      citations,
      sessionId: result.sessionId
    })
  } catch (err) {
    console.error('askDocsBot error:', err)
    return resp(500, { error: 'Internal error' })
  }
}
