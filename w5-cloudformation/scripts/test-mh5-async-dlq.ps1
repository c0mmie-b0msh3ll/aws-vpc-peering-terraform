param(
  [string]$Region = "us-east-1",
  [string]$StackName = "taskio-w5-ai-api"
)

$ErrorActionPreference = "Stop"

$stack = aws cloudformation describe-stacks `
  --region $Region `
  --stack-name $StackName `
  | ConvertFrom-Json

$functionName = ($stack.Stacks[0].Outputs | Where-Object { $_.OutputKey -eq "SummarizeWorkspaceFunctionName" }).OutputValue
$queueUrl = ($stack.Stacks[0].Outputs | Where-Object { $_.OutputKey -eq "SummarizeFailureQueueUrl" }).OutputValue

if (-not $functionName -or -not $queueUrl) {
  throw "Could not resolve function name or queue URL from $StackName outputs."
}

$payloadFile = Join-Path $env:TEMP "taskio-w5-async-payload.json"
$outFile = Join-Path $env:TEMP "taskio-w5-async-invoke.json"
@{
  forceFailure = $true
  pathParameters = @{}
  requestContext = @{
    authorizer = @{
      lambda = @{
        userId = "w5-demo"
      }
    }
  }
} | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $payloadFile -Encoding ascii

aws lambda invoke `
  --region $Region `
  --function-name $functionName `
  --invocation-type Event `
  --cli-binary-format raw-in-base64-out `
  --payload "file://$payloadFile" `
  $outFile | Out-Null

Start-Sleep -Seconds 10

aws sqs receive-message `
  --region $Region `
  --queue-url $queueUrl `
  --max-number-of-messages 1 `
  --wait-time-seconds 10 `
  --attribute-names All `
  --message-attribute-names All
