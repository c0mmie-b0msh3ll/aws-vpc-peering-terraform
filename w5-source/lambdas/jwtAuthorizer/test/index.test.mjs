import { test } from 'node:test'
import assert from 'node:assert'
import jwt from 'jsonwebtoken'

process.env.SSM_PARAM = '/taskio/jwt-secret'
process.env.MOCK_SSM_VALUE = 'test-secret-for-unit-test'

const { handler } = await import('../index.mjs')

test('returns isAuthorized=true for valid token', async () => {
  const token = jwt.sign({ _id: 'user-123', email: 'a@b.com' }, 'test-secret-for-unit-test', {
    algorithm: 'HS256',
    expiresIn: '15m'
  })
  const event = { headers: { authorization: `Bearer ${token}` } }
  const result = await handler(event)
  assert.strictEqual(result.isAuthorized, true)
  assert.strictEqual(result.context.userId, 'user-123')
  assert.strictEqual(result.context.email, 'a@b.com')
})

test('returns isAuthorized=false for expired token', async () => {
  const token = jwt.sign({ _id: 'user-123' }, 'test-secret-for-unit-test', {
    algorithm: 'HS256',
    expiresIn: '-1s'
  })
  const event = { headers: { authorization: `Bearer ${token}` } }
  const result = await handler(event)
  assert.strictEqual(result.isAuthorized, false)
})

test('returns isAuthorized=false for wrong signature', async () => {
  const token = jwt.sign({ _id: 'user-123' }, 'WRONG-SECRET', {
    algorithm: 'HS256', expiresIn: '15m'
  })
  const event = { headers: { authorization: `Bearer ${token}` } }
  const result = await handler(event)
  assert.strictEqual(result.isAuthorized, false)
})

test('returns isAuthorized=false when Authorization header missing', async () => {
  const event = { headers: {} }
  const result = await handler(event)
  assert.strictEqual(result.isAuthorized, false)
})

test('accepts Authorization header with capital A', async () => {
  const token = jwt.sign({ _id: 'u1', email: 'x@y.com' }, 'test-secret-for-unit-test', {
    algorithm: 'HS256', expiresIn: '15m'
  })
  const event = { headers: { Authorization: `Bearer ${token}` } }
  const result = await handler(event)
  assert.strictEqual(result.isAuthorized, true)
})
