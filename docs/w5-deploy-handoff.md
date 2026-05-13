# W5 Deploy Handoff

Tai lieu nay ghi lai full flow deploy TaskIO W5 sau buoc VPC/VPC Peering.

## 0. Scope

Buoc dau tien cua team la repo nay:

- Tao `vpc-application`
- Tao `vpc-ai`
- Tao public/private subnets
- Tao NAT Gateway
- Tao route tables
- Tao VPC Peering 2 chieu
- Bat VPC Flow Logs

Sau buoc network foundation, W5 deploy tiep cac phan:

- Backend chay tren EC2 trong private subnet, sau public ALB
- EFS mount chung vao cac EC2 backend de lam workspace export temporary storage
- REST API Gateway cho AI, co API Key + Usage Plan
- Lambda AI:
  - `jwtAuthorizer`
  - `askDocsBot`
  - `summarizeWorkspace`
- SQS failure destination cho async Lambda test/failure handling
- Frontend S3 + CloudFront

## 1. Current deployed architecture

Current AWS deploy dang chay theo CloudFormation W5 expanded implementation.

Main endpoints:

- Frontend: `https://taskio.nigga.in.net/`
- Backend API through CloudFront: `https://taskio.nigga.in.net/api/v1/health`
- AI REST API: `https://brvl2lapkl.execute-api.us-east-1.amazonaws.com/prod`

Important deployed resources:

- Backend ALB: `taskio-w5-api-alb-2090841571.us-east-1.elb.amazonaws.com`
- REST API Gateway: `taskio-w5-ai-rest-api`
- Usage Plan: `taskio-w5-ai-rest-usage-plan`
- Usage Plan limits:
  - Rate: `5 req/s`
  - Burst: `10`
  - Monthly quota: `1000`
- Lambda runtime:
  - `taskio-w5-jwtAuthorizer`
  - `taskio-w5-askDocsBot`
  - `taskio-w5-summarizeWorkspace`
- EFS mount path on backend EC2: `/mnt/taskio-shared`
- Workspace export path: `/mnt/taskio-shared/exports`

## 2. EFS export flow

EFS khong public ra Internet va khong tu serve download link.

Flow dung:

1. User bam export workspace.
2. Backend gom data/file cua workspace thanh ZIP.
3. ZIP duoc luu tam tren EFS, vi du:
   `/mnt/taskio-shared/exports/workspace-123.zip`
4. Backend tra ve mot download API URL.
5. Khi user bam download, request di qua CloudFront/ALB vao mot EC2 backend bat ky.
6. EC2 do doc ZIP tu EFS va stream file ve HTTP response.
7. Worker/cron cleanup file export cu theo TTL.

Ly do dung EFS:

- Tat ca EC2 backend mount chung EFS.
- File export tao boi instance A van doc duoc boi instance B.
- Khong can sticky session.
- Khong phu thuoc local disk cua mot EC2 cu the.

## 3. Deploy version A - Manual on AWS Console

Dung cach nay de demo tung buoc hoac khi mentor muon thay setup tren console.

### A1. Network foundation

Dung Terraform trong repo nay:

```bash
terraform init
terraform validate
terraform plan -out tfplan
terraform apply tfplan
terraform output
```

Can ghi lai outputs:

- Application VPC ID
- AI VPC ID
- Public subnet IDs
- Private subnet IDs
- VPC Peering ID
- Private route table IDs

### A2. Security groups

Tao cac security group trong Application VPC:

ALB SG:

- Inbound TCP 80 from `0.0.0.0/0`
- Inbound TCP 443 from `0.0.0.0/0` neu co HTTPS listener
- Egress all

App EC2 SG:

- Inbound TCP `8017` from ALB SG only
- Egress all, hoac restrict theo policy team

EFS SG:

- Inbound TCP `2049` from App EC2 SG only

### A3. EFS

Tao EFS:

- Encrypted: enabled
- Mount targets: private app subnets
- Security group: EFS SG
- Backup: enabled neu can

Mount path tren EC2:

```bash
/mnt/taskio-shared
```

Export directory:

```bash
/mnt/taskio-shared/exports
```

### A4. Backend artifact and environment

Tao S3 artifact bucket, upload backend zip:

```bash
aws s3 cp taskio-api.zip s3://<artifact-bucket>/backend/taskio-api.zip
```

Tao SSM SecureString cho backend `.env`:

```bash
aws ssm put-parameter \
  --name /taskio/w5/api-env \
  --type SecureString \
  --value file://api.env \
  --overwrite
```

Env production can co:

```text
BUILD_MODE=production
PORT=8017
LOCAL_DEV_APP_HOST=0.0.0.0
LOCAL_DEV_APP_PORT=8017
EFS_EXPORT_ROOT=/mnt/taskio-shared/exports
CORS_ALLOWED_ORIGINS=https://taskio.nigga.in.net,https://d2kt131o0m9hfi.cloudfront.net
```

### A5. Backend EC2/ASG/ALB

Tao launch template:

- AMI: Amazon Linux 2023
- Instance profile:
  - SSM Managed Instance Core
  - S3 read artifact bucket
  - SSM GetParameter `/taskio/w5/api-env`
  - KMS decrypt via SSM
- User data:
  - Install Node/npm, awscli, unzip, amazon-efs-utils, redis6
  - Start Redis cache on `6379`
  - Start Redis realtime on `6380`
  - Mount EFS to `/mnt/taskio-shared`
  - Download backend zip from S3
  - Pull `.env` from SSM
  - Run `npm ci`
  - Run `npm run build`
  - Start `node build/src/server.js` by systemd

Tao target group:

- Protocol: HTTP
- Port: `8017`
- Health check path: `/api/v1/health`

Tao ALB:

- Public subnets
- ALB SG
- Listener HTTP 80 forward to target group

Tao ASG:

- Private app subnets
- Desired 1, Min 1, Max 2
- Attach target group

### A6. AI Lambdas

Upload Lambda zips to S3:

```bash
aws s3 cp jwtAuthorizer.zip s3://<artifact-bucket>/lambda/jwtAuthorizer.zip
aws s3 cp askDocsBot.zip s3://<artifact-bucket>/lambda/askDocsBot.zip
aws s3 cp summarizeWorkspace.zip s3://<artifact-bucket>/lambda/summarizeWorkspace.zip
```

Create Lambdas:

- Runtime: `nodejs20.x`
- Timeout:
  - authorizer: 10s
  - AI lambdas: 30s
- Memory:
  - authorizer: 128 MB
  - AI lambdas: 512 MB

IAM:

- Authorizer:
  - CloudWatch Logs
  - SSM GetParameter JWT secret
  - KMS decrypt via SSM
- AI Lambdas:
  - CloudWatch Logs
  - Bedrock invoke/retrieve permissions
  - Secrets Manager read Mongo secret
  - SQS SendMessage to failure queue

### A7. REST API Gateway + Usage Plan

Create REST API:

- Name: `taskio-w5-ai-rest-api`
- Endpoint type: Regional

Resources/routes:

- `POST /ai/docs/ask`
- `POST /ai/workspaces/{workspaceId}/summary`
- `OPTIONS` for CORS on both routes

Authorizer:

- Type: Lambda TOKEN authorizer
- Identity source: `Authorization`
- Lambda: `taskio-w5-jwtAuthorizer`

Methods:

- Authorization: Custom authorizer
- API Key Required: true
- Integration: Lambda proxy

Usage Plan:

- Rate: `5 req/s`
- Burst: `10`
- Monthly quota: `1000`

API Key:

- Create one browser key
- Attach to Usage Plan

CORS:

- Allow origin: `https://taskio.nigga.in.net`
- Allow headers: `authorization,content-type,x-api-key`
- Allow methods: `POST,OPTIONS`

### A8. Frontend deploy

Set production env:

```text
VITE_API_ROOT=https://taskio.nigga.in.net/api
VITE_AI_API_URL=https://<rest-api-id>.execute-api.us-east-1.amazonaws.com/prod
VITE_AI_API_KEY=<api-key-value>
```

Build and upload:

```bash
npm run build
aws s3 sync dist/ s3://danhnam-taskio-frontend --region ap-southeast-1 --delete --exclude index.html --cache-control "public,max-age=31536000,immutable"
aws s3 cp dist/index.html s3://danhnam-taskio-frontend/index.html --region ap-southeast-1 --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html"
aws cloudfront create-invalidation --distribution-id E3GXHALT9JVH6U --paths / /index.html
```

## 4. Deploy version B - AWS CLI + CloudFormation

Dung cach nay cho clean/repeatable deploy.

### B1. Network foundation

Van dung Terraform repo nay cho buoc dau:

```bash
terraform init
terraform validate
terraform plan -out tfplan
terraform apply tfplan
terraform output
```

Lay outputs VPC/subnet/route table de truyen vao cac stack tiep theo.

### B2. CloudFormation source

Source nam trong:

```text
w5-cloudformation/
```

Main templates:

- `cloudformation/w5-backend.yaml`
  - Backend ALB, Target Group, Launch Template, ASG, EC2 IAM role, EFS mount in user data.
- `cloudformation/w5-ai-api.yaml`
  - Lambda runtime stack: authorizer, AI lambdas, SQS failure queue.
- `cloudformation/w5-ai-rest-api.yaml`
  - REST API Gateway, Lambda authorizer, API Key, Usage Plan, access logs.
- `cloudformation/w5-foundation.all-in-one.yaml`
  - Reference/all-in-one template used in current deployment. This creates its own VPC, so do not use it together with Terraform foundation unless intentionally creating a separate environment.

### B3. Package backend

```powershell
$stage = "E:\bomb\.deploy\taskio-api-package"
$zip = "E:\bomb\.deploy\taskio-api.zip"
Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $zip -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $stage -Force | Out-Null
$exclude = @(".git", "node_modules", "build", ".env")
Get-ChildItem -LiteralPath "E:\bomb\taskio-api" -Force |
  Where-Object { $exclude -notcontains $_.Name } |
  ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $stage -Recurse -Force }
tar -a -cf $zip -C $stage .
aws s3 cp $zip s3://<artifact-bucket>/backend/taskio-api.zip --region us-east-1
```

### B4. Store backend env in SSM

```bash
aws ssm put-parameter \
  --region us-east-1 \
  --name /taskio/w5/api-env \
  --type SecureString \
  --value file://api.env \
  --overwrite
```

### B5. Deploy backend stack

Before this step, create or provide:

- VPC ID
- public subnet IDs
- app private subnet IDs
- ALB SG ID
- App SG ID
- EFS file system ID
- artifact bucket

Then:

```bash
aws cloudformation deploy \
  --region us-east-1 \
  --stack-name taskio-w5-backend \
  --template-file w5-cloudformation/cloudformation/w5-backend.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=taskio-w5 \
    VpcId=<application-vpc-id> \
    PublicSubnetIds=<public-subnet-a>,<public-subnet-b> \
    AppPrivateSubnetIds=<private-subnet-a>,<private-subnet-b> \
    AlbSecurityGroupId=<alb-sg-id> \
    AppSecurityGroupId=<app-sg-id> \
    EfsFileSystemId=<efs-id> \
    ArtifactBucket=<artifact-bucket> \
    ArtifactKey=backend/taskio-api.zip \
    EnvParameterName=/taskio/w5/api-env \
    DesiredCapacity=1 \
    MinSize=1 \
    MaxSize=2 \
    ApiPort=8017
```

### B6. Package and upload Lambdas

```powershell
tar -a -cf E:\bomb\taskio-ai-lambdas\jwtAuthorizer.zip -C E:\bomb\taskio-ai-lambdas\jwtAuthorizer .
tar -a -cf E:\bomb\taskio-ai-lambdas\askDocsBot.zip -C E:\bomb\taskio-ai-lambdas\askDocsBot .
tar -a -cf E:\bomb\taskio-ai-lambdas\summarizeWorkspace.zip -C E:\bomb\taskio-ai-lambdas\summarizeWorkspace .

aws s3 cp E:\bomb\taskio-ai-lambdas\jwtAuthorizer.zip s3://<artifact-bucket>/lambda/jwtAuthorizer.zip --region us-east-1
aws s3 cp E:\bomb\taskio-ai-lambdas\askDocsBot.zip s3://<artifact-bucket>/lambda/askDocsBot.zip --region us-east-1
aws s3 cp E:\bomb\taskio-ai-lambdas\summarizeWorkspace.zip s3://<artifact-bucket>/lambda/summarizeWorkspace.zip --region us-east-1
```

### B7. Deploy AI Lambda runtime stack

```bash
aws cloudformation deploy \
  --region us-east-1 \
  --stack-name taskio-w5-ai-api \
  --template-file w5-cloudformation/cloudformation/w5-ai-api.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=taskio-w5 \
    ArtifactBucket=<artifact-bucket> \
    JwtAuthorizerKey=lambda/jwtAuthorizer.zip \
    AskDocsBotKey=lambda/askDocsBot.zip \
    SummarizeWorkspaceKey=lambda/summarizeWorkspace.zip \
    JwtSecretParameterName=/taskio/jwt-secret \
    KnowledgeBaseId=<bedrock-kb-id> \
    ModelArn=<bedrock-model-or-inference-profile-arn> \
    MongoSecretArn=<mongo-secret-arn>
```

### B8. Deploy REST API + Usage Plan

Generate an API key value:

```powershell
$key = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
Set-Content -LiteralPath .\ai-rest-api-key.txt -Value $key -Encoding ascii
```

Deploy:

```bash
aws cloudformation deploy \
  --region us-east-1 \
  --stack-name taskio-w5-ai-rest-api \
  --template-file w5-cloudformation/cloudformation/w5-ai-rest-api.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=taskio-w5 \
    JwtAuthorizerFunctionName=taskio-w5-jwtAuthorizer \
    AskDocsBotFunctionName=taskio-w5-askDocsBot \
    SummarizeWorkspaceFunctionName=taskio-w5-summarizeWorkspace \
    AllowedOrigin=https://taskio.nigga.in.net \
    ApiKeyValue=<api-key-value> \
    UsagePlanRateLimit=5 \
    UsagePlanBurstLimit=10 \
    MonthlyQuotaLimit=1000
```

Get outputs:

```bash
aws cloudformation describe-stacks \
  --region us-east-1 \
  --stack-name taskio-w5-ai-rest-api \
  --query "Stacks[0].Outputs" \
  --output table
```

### B9. Update frontend

Set `.env.production`:

```text
VITE_API_ROOT=https://taskio.nigga.in.net/api
VITE_AI_API_URL=https://<rest-api-id>.execute-api.us-east-1.amazonaws.com/prod
VITE_AI_API_KEY=<api-key-value>
```

Build/deploy:

```bash
npm run build
aws s3 sync dist/ s3://danhnam-taskio-frontend --region ap-southeast-1 --delete --exclude index.html --cache-control "public,max-age=31536000,immutable"
aws s3 cp dist/index.html s3://danhnam-taskio-frontend/index.html --region ap-southeast-1 --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html"
aws cloudfront create-invalidation --distribution-id E3GXHALT9JVH6U --paths / /index.html
```

## 5. Verification commands

Backend:

```bash
curl -i https://taskio.nigga.in.net/api/v1/health
```

ALB target health:

```bash
aws elbv2 describe-target-health \
  --region us-east-1 \
  --target-group-arn <target-group-arn>
```

REST API preflight:

```bash
curl -i -X OPTIONS \
  https://<rest-api-id>.execute-api.us-east-1.amazonaws.com/prod/ai/docs/ask \
  -H "Origin: https://taskio.nigga.in.net" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type,x-api-key"
```

Usage Plan:

```bash
aws apigateway get-usage-plans --region us-east-1
```

EFS mount on EC2 through SSM:

```bash
findmnt /mnt/taskio-shared
df -h /mnt/taskio-shared
```

## 6. Known notes

- REST API Usage Plan works by API key. In a browser SPA, API key is visible in network/bundle, so it is not a strong secret.
- API key + Usage Plan is useful for Gateway-level throttling/quota.
- True per-user or per-workspace quota should still be implemented in DB using JWT `userId`/workspace subscription.
- Current DB already has `subscriptions.planFeatureSnapshot.limits`, but does not yet have an AI usage counter collection.
- Suggested future collection: `aiUsageCounters`.
- `askDocsBot` currently depends on a valid Bedrock Knowledge Base ID. If KB ID is missing/deleted, gateway/auth layer works but Lambda returns internal error.

## 7. Recommended message to team

Repo nay la buoc network foundation bang Terraform. Sau khi VPC/Peering xong, team deploy expanded W5 layer bang CloudFormation/CLI hoac thao tac console. Current production da migrate AI tu HTTP API sang REST API de co API Key + Usage Plan. Backend chay EC2 private subnet sau ALB, EFS dung lam shared temporary storage cho workspace export.
