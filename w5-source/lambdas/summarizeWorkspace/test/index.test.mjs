import { test, mock } from 'node:test'
import assert from 'node:assert'

process.env.MODEL_ARN = 'arn:aws:bedrock:us-east-1::inference-profile/test'
process.env.MONGO_SECRET_ARN = 'arn:test'

const mod = await import('../index.mjs')

function mockBedrockOK() {
  mod.__deps.bedrockClient = {
    send: async () => ({
      output: {
        message: {
          content: [{ text: '## Tổng quan\nWorkspace có 1 board, 1 card.' }]
        }
      }
    })
  }
}

test('returns 200 with summary for valid workspace', async () => {
  mockBedrockOK()
  mod.__deps.fetchWorkspaceBundle = async () => ({
    workspace: { _id: 'w1', title: 'Test', memberCount: 1 },
    boards: [{ _id: 'b1', title: 'B' }],
    columns: [{ _id: 'c1', title: 'Col', boardId: 'b1' }],
    cards: [{
      _id: 'card1', title: 'T', columnId: 'c1', boardId: 'b1',
      memberIds: [], dueAt: null, isCompleted: false,
      taskCount: 0, completedTaskCount: 0
    }]
  })
  const event = {
    pathParameters: { workspaceId: 'ws-abc' },
    requestContext: { authorizer: { lambda: { userId: 'u1' } } }
  }
  const result = await mod.handler(event)
  assert.strictEqual(result.statusCode, 200)
  const body = JSON.parse(result.body)
  assert.ok(body.summary.includes('Tổng quan'))
  assert.strictEqual(body.cardCount, 1)
  assert.strictEqual(body.boardCount, 1)
})

test('returns 403 when user is not a member', async () => {
  mockBedrockOK()
  mod.__deps.fetchWorkspaceBundle = async () => ({ forbidden: true })
  const event = {
    pathParameters: { workspaceId: 'forbidden-ws' },
    requestContext: { authorizer: { lambda: { userId: 'u1' } } }
  }
  const result = await mod.handler(event)
  assert.strictEqual(result.statusCode, 403)
})

test('returns 404 when workspace does not exist', async () => {
  mockBedrockOK()
  mod.__deps.fetchWorkspaceBundle = async () => null
  const event = {
    pathParameters: { workspaceId: 'missing-ws' },
    requestContext: { authorizer: { lambda: { userId: 'u1' } } }
  }
  const result = await mod.handler(event)
  assert.strictEqual(result.statusCode, 404)
})

test('returns 400 when workspaceId missing', async () => {
  const event = {
    pathParameters: {},
    requestContext: { authorizer: { lambda: { userId: 'u1' } } }
  }
  const result = await mod.handler(event)
  assert.strictEqual(result.statusCode, 400)
})

test('returns 401 when userId missing from authorizer', async () => {
  const event = {
    pathParameters: { workspaceId: 'ws-abc' },
    requestContext: {}
  }
  const result = await mod.handler(event)
  assert.strictEqual(result.statusCode, 401)
})

test('returns 413 when workspace over hard limit', async () => {
  mockBedrockOK()
  mod.__deps.fetchWorkspaceBundle = async () => ({
    workspace: { _id: 'w', title: 'X', memberCount: 1 },
    boards: [{ _id: 'b', title: 'B' }],
    columns: [{ _id: 'c', title: 'C', boardId: 'b' }],
    cards: Array.from({ length: 600 }, (_, i) => ({
      _id: `c${i}`, title: `t${i}`, columnId: 'c', boardId: 'b',
      memberIds: [], dueAt: null, isCompleted: false,
      taskCount: 0, completedTaskCount: 0,
      updatedAt: new Date().toISOString()
    }))
  })
  const event = {
    pathParameters: { workspaceId: 'ws' },
    requestContext: { authorizer: { lambda: { userId: 'u1' } } }
  }
  const result = await mod.handler(event)
  assert.strictEqual(result.statusCode, 413)
})
