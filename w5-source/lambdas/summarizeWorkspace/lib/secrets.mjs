import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' })
const cache = new Map()

export async function getSecretJson(arn) {
  if (cache.has(arn)) return cache.get(arn)
  const resp = await client.send(new GetSecretValueCommand({ SecretId: arn }))
  const parsed = JSON.parse(resp.SecretString)
  cache.set(arn, parsed)
  return parsed
}
