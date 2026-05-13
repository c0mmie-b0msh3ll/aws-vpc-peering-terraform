param(
  [string]$Region = "us-east-1",
  [string]$ProjectName = "taskio-w5",
  [string]$ArtifactBucket = "",
  [string]$JwtSecret = "",
  [string]$JwtSecretParameterName = "/taskio/jwt-secret",
  [string]$KnowledgeBaseId = "2A19U3YA4W",
  [string]$ModelArn = "arn:aws:bedrock:us-east-1:589077667575:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0",
  [string]$MongoSecretArn = "arn:aws:secretsmanager:us-east-1:589077667575:secret:taskio/mongo/ai-readonly-nM7EzC",
  [string]$AllowedOrigin = "https://taskio.nigga.in.net"
)

$ErrorActionPreference = "Stop"
if (Get-Variable PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$foundationStack = "$ProjectName-foundation"
$apiStack = "$ProjectName-ai-api"

if (-not $ArtifactBucket) {
  $accountId = aws sts get-caller-identity --query Account --output text --region $Region
  $ArtifactBucket = "$ProjectName-artifacts-$accountId-$Region"
}

Write-Host "Using artifact bucket: $ArtifactBucket"
cmd /c "aws s3api head-bucket --bucket $ArtifactBucket 2>NUL"
if ($LASTEXITCODE -ne 0) {
  if ($Region -eq "us-east-1") {
    aws s3api create-bucket --bucket $ArtifactBucket --region $Region | Out-Null
  } else {
    aws s3api create-bucket `
      --bucket $ArtifactBucket `
      --region $Region `
      --create-bucket-configuration LocationConstraint=$Region | Out-Null
  }
}

$lambdaDir = Join-Path $root "taskio-ai-lambdas"
$keys = @{
  JwtAuthorizer = "lambda/jwtAuthorizer.zip"
  AskDocsBot = "lambda/askDocsBot.zip"
  SummarizeWorkspace = "lambda/summarizeWorkspace.zip"
}

aws s3 cp (Join-Path $lambdaDir "jwtAuthorizer.zip") "s3://$ArtifactBucket/$($keys.JwtAuthorizer)" --region $Region | Out-Null
aws s3 cp (Join-Path $lambdaDir "askDocsBot.zip") "s3://$ArtifactBucket/$($keys.AskDocsBot)" --region $Region | Out-Null
aws s3 cp (Join-Path $lambdaDir "summarizeWorkspace.zip") "s3://$ArtifactBucket/$($keys.SummarizeWorkspace)" --region $Region | Out-Null

if ($JwtSecret) {
  aws ssm put-parameter `
    --region $Region `
    --name $JwtSecretParameterName `
    --type SecureString `
    --value $JwtSecret `
    --overwrite | Out-Null
} else {
  Write-Warning "JwtSecret was not provided. The SSM parameter must already exist: $JwtSecretParameterName"
}

aws cloudformation deploy `
  --region $Region `
  --stack-name $foundationStack `
  --template-file (Join-Path $root "infra\w5\cloudformation\w5-foundation.yaml") `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides ProjectName=$ProjectName

& (Join-Path $root "infra\w5\scripts\update-firewall-routes.ps1") `
  -Region $Region `
  -StackName $foundationStack

aws cloudformation deploy `
  --region $Region `
  --stack-name $apiStack `
  --template-file (Join-Path $root "infra\w5\cloudformation\w5-ai-api.yaml") `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides `
    ProjectName=$ProjectName `
    ArtifactBucket=$ArtifactBucket `
    JwtAuthorizerKey=$($keys.JwtAuthorizer) `
    AskDocsBotKey=$($keys.AskDocsBot) `
    SummarizeWorkspaceKey=$($keys.SummarizeWorkspace) `
    JwtSecretParameterName=$JwtSecretParameterName `
    KnowledgeBaseId=$KnowledgeBaseId `
    ModelArn=$ModelArn `
    MongoSecretArn=$MongoSecretArn `
    AllowedOrigin=$AllowedOrigin

Write-Host "W5 stacks deployed."
aws cloudformation describe-stacks --region $Region --stack-name $foundationStack --query "Stacks[0].Outputs" --output table
aws cloudformation describe-stacks --region $Region --stack-name $apiStack --query "Stacks[0].Outputs" --output table
