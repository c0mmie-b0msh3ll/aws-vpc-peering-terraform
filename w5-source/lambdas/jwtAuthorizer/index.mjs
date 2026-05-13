import jwt from 'jsonwebtoken'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const ssm = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' })

let cachedSecret = null

async function getSecret() {
  if (cachedSecret) return cachedSecret
  if (process.env.MOCK_SSM_VALUE) {
    cachedSecret = process.env.MOCK_SSM_VALUE
    return cachedSecret
  }
  const resp = await ssm.send(new GetParameterCommand({
    Name: process.env.SSM_PARAM,
    WithDecryption: true
  }))
  cachedSecret = resp.Parameter.Value
  return cachedSecret
}

function httpApiDeny() {
  return { isAuthorized: false }
}

function restApiPolicy(effect, methodArn, context = {}) {
  return {
    principalId: context.userId || 'anonymous',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn || '*'
        }
      ]
    },
    context
  }
}

function deny(event) {
  if (event?.methodArn) return restApiPolicy('Deny', event.methodArn)
  return httpApiDeny()
}

export async function handler(event) {
  try {
    const authHeader =
      event.authorizationToken ||
      event.headers?.authorization ||
      event.headers?.Authorization
    if (!authHeader?.startsWith('Bearer ')) return deny(event)
    const token = authHeader.slice(7)

    const secret = await getSecret()
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] })

    const context = {
      userId: String(decoded._id),
      email: decoded.email || ''
    }

    if (event.methodArn) {
      return restApiPolicy('Allow', event.methodArn, context)
    }

    return {
      isAuthorized: true,
      context
    }
  } catch (err) {
    console.warn('Authorizer denied:', err.message)
    return deny(event)
  }
}
