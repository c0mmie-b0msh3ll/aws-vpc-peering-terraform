import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from '@aws-sdk/client-bedrock-runtime'
import { env } from '~/config/environment'

let bedrockClient = null

const GET_BEDROCK_CLIENT = () => {
  if (bedrockClient) return bedrockClient

  bedrockClient = new BedrockRuntimeClient({
    region: env.BEDROCK_REGION,
    credentials: {
      accessKeyId: env.BEDROCK_AWS_ACCESS_KEY_ID,
      secretAccessKey: env.BEDROCK_AWS_SECRET_ACCESS_KEY
    }
  })

  return bedrockClient
}

const invokeModel = async ({ prompt, maxTokens = 1024 }) => {
  const client = GET_BEDROCK_CLIENT()

  const command = new InvokeModelCommand({
    modelId: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const response = await client.send(command)
  const body = JSON.parse(new TextDecoder().decode(response.body))

  return body.content[0].text
}

export { GET_BEDROCK_CLIENT, invokeModel }
