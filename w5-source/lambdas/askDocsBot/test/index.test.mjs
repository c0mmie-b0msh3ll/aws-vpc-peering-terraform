import { test, mock } from 'node:test'
import assert from 'node:assert'

process.env.KB_ID = 'test-kb-id'
process.env.MODEL_ARN = 'arn:aws:bedrock:us-east-1::inference-profile/test-model'

const mod = await import('../index.mjs')

test('returns answer, citations, sessionId for valid question', async () => {
  mod.__deps.bedrockClient = {
    send: async () => ({
      output: { text: 'Để tạo workspace, bạn vào...' },
      citations: [{
        retrievedReferences: [{
          location: { s3Location: { uri: 's3://bucket/guides/user-guide.pdf' } },
          content: { text: 'some chunk content' }
        }]
      }],
      sessionId: 'sess-xyz'
    })
  }
  const event = {
    body: JSON.stringify({ question: 'Làm sao tạo workspace?' }),
    requestContext: { authorizer: { lambda: { userId: 'u1' } } }
  }
  const result = await mod.handler(event)
  assert.strictEqual(result.statusCode, 200)
  const body = JSON.parse(result.body)
  assert.ok(body.answer.includes('workspace'))
  assert.strictEqual(body.sessionId, 'sess-xyz')
  assert.ok(Array.isArray(body.citations))
  assert.strictEqual(body.citations.length, 1)
  assert.strictEqual(body.citations[0].source, 's3://bucket/guides/user-guide.pdf')
})

test('returns 400 when question missing', async () => {
  const event = {
    body: JSON.stringify({}),
    requestContext: { authorizer: { lambda: { userId: 'u1' } } }
  }
  const result = await mod.handler(event)
  assert.strictEqual(result.statusCode, 400)
  const body = JSON.parse(result.body)
  assert.match(body.error, /required/i)
})

test('returns 400 when question empty string', async () => {
  const event = {
    body: JSON.stringify({ question: '   ' }),
    requestContext: { authorizer: { lambda: { userId: 'u1' } } }
  }
  const result = await mod.handler(event)
  assert.strictEqual(result.statusCode, 400)
})

test('passes sessionId to Bedrock when provided', async () => {
  let capturedInput = null
  mod.__deps.bedrockClient = {
    send: async (cmd) => {
      capturedInput = cmd.input
      return { output: { text: 'ok' }, citations: [], sessionId: 'new-sess' }
    }
  }
  const event = {
    body: JSON.stringify({ question: 'test?', sessionId: 'existing-sess' }),
    requestContext: { authorizer: { lambda: { userId: 'u1' } } }
  }
  await mod.handler(event)
  assert.strictEqual(capturedInput.sessionId, 'existing-sess')
})

test('returns 500 on Bedrock error', async () => {
  mod.__deps.bedrockClient = {
    send: async () => { throw new Error('Bedrock throttled') }
  }
  const event = {
    body: JSON.stringify({ question: 'test?' }),
    requestContext: { authorizer: { lambda: { userId: 'u1' } } }
  }
  const result = await mod.handler(event)
  assert.strictEqual(result.statusCode, 500)
})
