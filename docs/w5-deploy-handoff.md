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
- Bedrock Knowledge Base cho chatbot docs
- Lambda AI:
  - `jwtAuthorizer`
  - `askDocsBot`
  - `summarizeWorkspace`
- SQS failure destination cho async Lambda test/failure handling
- Frontend S3 + CloudFront

## 1. Current deployed architecture

Current AWS deploy dang chay theo W5 expanded implementation. CloudFormation da tung duoc dung de validate nhanh resource shape, nhung handoff cho team se uu tien deploy tay tren Console hoac bang AWS CLI.

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

## 3. Runtime config and env wiring

Phan nay la mapping de noi cac service lai voi nhau sau khi deploy. Khong commit file `.env` that vao git.

### 3.1 Outputs can lay sau tung buoc

Terraform network outputs:

- Application VPC ID -> tao ALB/App/EFS security groups.
- Public subnet IDs -> ALB.
- Private app subnet IDs -> backend ASG + EFS mount targets.
- AI VPC/private subnet IDs -> chi can neu Lambda/datastore can chay trong VPC.
- Route table/VPC Peering outputs -> verify routing giua VPC app va VPC AI.

Backend deploy outputs:

- ALB DNS name -> dung lam origin cho CloudFront `/api/*`.
- EFS ID -> mount vao backend EC2, user data thay vao `EFS_ID`.
- App SG ID -> allow EFS inbound NFS `2049`.
- Backend health URL -> verify `/api/v1/health`.

Bedrock KB outputs:

- Knowledge Base ID -> set vao Lambda `askDocsBot` env `KB_ID`.
- Model/inference profile ARN -> set vao AI Lambdas env `MODEL_ARN`.

DocumentDB outputs:

- Cluster endpoint -> set vao backend `MONGODB_URI`.
- Cluster port, usually `27017` -> include in URI.
- DB security group ID -> allow inbound only from App EC2 SG and Lambda SG if Lambda needs DB.
- DocumentDB secret ARN -> set vao Lambda `summarizeWorkspace` env `MONGO_SECRET_ARN`.

REST API Gateway outputs:

- REST API invoke URL -> set vao frontend `VITE_AI_API_URL`.
- API key value -> set vao frontend `VITE_AI_API_KEY`.
- Usage Plan ID/API Key ID -> verify throttle/quota.

CloudFront/frontend outputs:

- Frontend domain -> set backend CORS `CORS_ALLOWED_ORIGINS`.
- CloudFront distribution ID -> dung de invalidate sau moi lan deploy frontend.

### 3.2 VPC placement note for deploy

Sau Terraform foundation, team co 2 VPC:

- `vpc-application`: app runtime boundary.
- `vpc-ai`: AI/private integration boundary.

Deploy placement hien tai:

- Backend EC2, ALB, EFS, DocumentDB, Redis: dat trong `vpc-application`.
- `summarizeWorkspace` Lambda: neu can doc DocumentDB private endpoint thi attach vao private subnets cua `vpc-application`.
- `askDocsBot` Lambda: chi goi Bedrock KB nen co the de ngoai VPC.
- `jwtAuthorizer` Lambda: chi doc SSM JWT secret nen co the de ngoai VPC.
- Bedrock Knowledge Base: AWS managed service, khong nam truc tiep trong subnet cua `vpc-ai` hay `vpc-application`.

Important:

- Khong phai cu "AI Lambda" la bat buoc deploy vao `vpc-ai`.
- Chi attach Lambda vao VPC khi Lambda can access private resource nhu DocumentDB/Redis/private endpoint.
- Neu sau nay dat AI worker/private service trong `vpc-ai` va can doc DB o `vpc-application`, phai co VPC Peering route 2 chieu va SG/CIDR allow port can thiet.
- VPC Flow Logs bat tren ca 2 VPC de audit traffic qua peering.

### 3.3 AWS DocumentDB setup

Team dung AWS DocumentDB lam database chinh. DocumentDB khong public ra Internet; dat trong private subnet cua VPC.

Recommended placement:

- VPC: `vpc-application`.
- Subnets: private subnets across 2 AZ, hoac DB private subnets rieng neu team tao them.
- Public access: disabled/not applicable.
- Security group: `documentdb-sg`.
- Inbound:
  - TCP `27017` from App EC2 SG.
  - TCP `27017` from Lambda SG neu `summarizeWorkspace` Lambda attach VPC de doc DB.
- Outbound: default/allow within VPC.

Manual deploy steps on Console:

1. VPC > Subnet groups/DocumentDB subnet group:
   - Create subnet group `taskio-w5-docdb-subnet-group`.
   - Add private subnets in 2 AZ.
2. EC2 > Security Groups:
   - Create `taskio-w5-documentdb-sg` in `vpc-application`.
   - Allow inbound `27017` from backend App EC2 SG.
   - If Lambda needs direct DocumentDB access, create Lambda SG and allow `27017` from that SG too.
3. Amazon DocumentDB > Clusters > Create:
   - Engine: Amazon DocumentDB.
   - Cluster name: `taskio-w5-docdb`.
   - Subnet group: `taskio-w5-docdb-subnet-group`.
   - VPC security group: `taskio-w5-documentdb-sg`.
   - Instances: at least 1 writer, optional second instance in another AZ for HA.
   - Encryption at rest: enabled.
   - Backup retention: enable theo yeu cau project.
4. Secrets Manager:
   - Store username/password/URI for app use.
   - Lambda `summarizeWorkspace` reads this through `MONGO_SECRET_ARN`.

Connection string format:

```text
MONGODB_URI=mongodb://<username>:<password>@<docdb-cluster-endpoint>:27017/taskio?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
DATABASE_NAME=taskio
```

Notes:

- DocumentDB requires TLS in normal production setup. Backend/Lambda need Amazon DocumentDB CA bundle, commonly `global-bundle.pem`, available in source/reference.
- If Lambda reads DocumentDB, it must run inside VPC private subnets that can route to DocumentDB. A Lambda outside VPC cannot reach a private DocumentDB endpoint.
- If DocumentDB is placed in `vpc-ai` instead of `vpc-application`, ensure VPC peering routes and SG/CIDR rules allow app/Lambda traffic to port `27017`.
- Frontend never connects to DocumentDB directly. Frontend only talks to backend/API Gateway.

### 3.4 Backend API env

Store backend env trong SSM SecureString, vi du `/taskio/w5/api-env`. EC2 user data pull ve `/opt/taskio-api/.env`.

Minimal production env:

```text
BUILD_MODE=production
LOCAL_DEV_APP_HOST=0.0.0.0
LOCAL_DEV_APP_PORT=8017

MONGODB_URI=mongodb://<username>:<password>@<docdb-cluster-endpoint>:27017/taskio?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
DATABASE_NAME=taskio

WEBSITE_DOMAIN_PRODUCTION=https://taskio.nigga.in.net
CORS_ALLOWED_ORIGINS=https://taskio.nigga.in.net,https://<cloudfront-domain>

ACCESS_TOKEN_SECRET_SIGNATURE=<jwt-access-secret>
ACCESS_TOKEN_LIFE=1d
REFRESH_TOKEN_SECRET_SIGNATURE=<jwt-refresh-secret>
REFRESH_TOKEN_LIFE=30d
AI_TOKEN_LIFE=15m

REDIS_CACHE_HOST=127.0.0.1
REDIS_CACHE_PORT=6379
REDIS_CACHE_PASSWORD=
REDIS_REALTIME_HOST=127.0.0.1
REDIS_REALTIME_PORT=6380
REDIS_REALTIME_PASSWORD=

EFS_EXPORT_ROOT=/mnt/taskio-shared/exports

AWS_REGION=us-east-1
AWS_S3_BUCKET=<app-upload-bucket>
AWS_CLOUDFRONT_DOMAIN=<asset-cloudfront-domain-if-any>

BEDROCK_REGION=us-east-1
```

Optional/provider env neu feature dang dung:

```text
AUTHOR=TaskIO
EMAIL_USERNAME=<smtp-username>
EMAIL_PASSWORD=<smtp-password>
API_KEY_MAIL=<brevo-api-key>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud>
CLOUDINARY_API_KEY=<cloudinary-key>
CLOUDINARY_API_SECRET=<cloudinary-secret>
BEDROCK_AWS_ACCESS_KEY_ID=
BEDROCK_AWS_SECRET_ACCESS_KEY=
```

Notes:

- Tren EC2 nen uu tien instance profile/IAM role thay vi hardcode `BEDROCK_AWS_ACCESS_KEY_ID` va `BEDROCK_AWS_SECRET_ACCESS_KEY`.
- `ACCESS_TOKEN_SECRET_SIGNATURE` phai trung voi secret ma Lambda authorizer dung de verify JWT.
- `CORS_ALLOWED_ORIGINS` phai co frontend domain, neu khong browser se bi CORS.

### 3.5 Lambda env

`jwtAuthorizer`:

```text
AWS_REGION=us-east-1
SSM_PARAM=/taskio/w5/jwt-access-secret
```

SSM param `/taskio/w5/jwt-access-secret` phai co cung gia tri voi backend `ACCESS_TOKEN_SECRET_SIGNATURE`.

`askDocsBot`:

```text
AWS_REGION=us-west-2
KB_ID=<bedrock-kb-id>
MODEL_ARN=<bedrock-retrieve-generate-model-or-inference-profile-arn>
```

`summarizeWorkspace`:

```text
AWS_REGION=us-east-1
MODEL_ARN=<bedrock-converse-model-or-inference-profile-arn>
MONGO_SECRET_ARN=<secrets-manager-secret-arn>
```

Mongo secret cho `summarizeWorkspace` nen la Secrets Manager JSON:

```json
{
  "uri": "mongodb://<username>:<password>@<docdb-cluster-endpoint>:27017/taskio?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false",
  "database": "taskio"
}
```

Notes:

- `askDocsBot` source hien tai doc bien `KB_ID`, khong phai `KNOWLEDGE_BASE_ID`.
- `summarizeWorkspace` can VPC config neu doc DocumentDB private endpoint.
- `MODEL_ARN` co the khac nhau giua chatbot docs va workspace summary tuy model/region team chon.
- Lambda IAM role can CloudWatch Logs, Bedrock permissions, va SSM/Secrets Manager permissions tuong ung.

### 3.6 Frontend env

File local build: `w5-source/frontend/.env.production`.

```text
VITE_API_ROOT=https://taskio.nigga.in.net/api
VITE_AI_API_URL=https://<rest-api-id>.execute-api.us-east-1.amazonaws.com/prod
VITE_AI_API_KEY=<api-gateway-api-key-value>
```

Mapping:

- `VITE_API_ROOT` tro ve backend API qua CloudFront/ALB.
- `VITE_AI_API_URL` tro ve REST API Gateway stage `/prod`.
- `VITE_AI_API_KEY` la browser API key gan voi Usage Plan.

Note: API key trong SPA khong phai secret manh vi user co the thay trong browser. No dung de Gateway throttle/quota, con auth that van la JWT qua Lambda authorizer.

### 3.7 Config bridge checklist

Truoc khi test end-to-end, check cac diem nay:

- Backend `.env`: `ACCESS_TOKEN_SECRET_SIGNATURE` da set.
- Backend `.env`: `MONGODB_URI` tro den DocumentDB cluster endpoint private.
- DocumentDB SG: allow `27017` from App EC2 SG.
- SSM `/taskio/w5/jwt-access-secret`: cung gia tri voi backend access token secret.
- Lambda `jwtAuthorizer`: `SSM_PARAM=/taskio/w5/jwt-access-secret`.
- Bedrock KB da sync docs AI va co `KB_ID`.
- Lambda `askDocsBot`: co `KB_ID` va `MODEL_ARN`.
- Lambda `summarizeWorkspace`: co `MODEL_ARN` va `MONGO_SECRET_ARN`.
- Lambda `summarizeWorkspace`: attach VPC/private subnet + Lambda SG neu can doc DocumentDB private endpoint.
- DocumentDB SG: allow `27017` from Lambda SG neu Lambda doc DB.
- REST API methods: `API Key Required=true`, Custom Authorizer enabled.
- Usage Plan: da attach API stage va API key.
- Frontend `.env.production`: co `VITE_API_ROOT`, `VITE_AI_API_URL`, `VITE_AI_API_KEY`.
- Backend CORS: allow frontend domain.
- CloudFront: route `/api/*` ve backend ALB, frontend default origin ve S3.

## 4. Deploy version A - Manual on AWS Console

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

### A4. DocumentDB

Tao DocumentDB truoc backend de backend env co san endpoint.

Console steps ngan gon:

1. Tao DocumentDB subnet group trong private subnets cua `vpc-application`.
2. Tao `documentdb-sg`, inbound TCP `27017` from App EC2 SG.
3. Tao DocumentDB cluster `taskio-w5-docdb`, encrypted, subnet group private, SG `documentdb-sg`.
4. Ghi lai cluster endpoint.
5. Tao Secrets Manager secret cho Lambda summary:

```json
{
  "uri": "mongodb://<username>:<password>@<docdb-cluster-endpoint>:27017/taskio?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false",
  "database": "taskio"
}
```

6. Set backend `.env`/SSM:

```text
MONGODB_URI=mongodb://<username>:<password>@<docdb-cluster-endpoint>:27017/taskio?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
DATABASE_NAME=taskio
```

### A5. Backend artifact and environment

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

### A6. Backend EC2/ASG/ALB

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

### A7. Bedrock Knowledge Base for docs chatbot

Buoc nay can lam truoc khi tao/cau hinh `askDocsBot`, vi Lambda can `KB_ID`.

Nguon docs AI:

- Lay file docs AI tu anh Tien.
- Upload vao S3 docs bucket rieng, vi du `taskio-w5-ai-docs-<account-id>`.
- Khong upload secret, `.env`, access key, private note vao bucket docs.

Setup tren AWS Console:

1. Vao Amazon Bedrock > Knowledge Bases.
2. Create knowledge base.
3. Name: `taskio-w5-docs-kb`.
4. IAM role:
   - Co the de Bedrock auto-create role.
   - Role can doc S3 docs bucket va ghi/doc vector store.
5. Data source:
   - Type: S3.
   - S3 URI: `s3://<docs-bucket>/<docs-prefix>/`.
6. Embedding model:
   - Amazon Titan Text Embeddings v2.
7. Vector store:
   - Dung option ma lab/account ho tro, vi du S3 Vectors/OpenSearch Serverless.
   - Neu dung S3 Vectors, tao vector bucket/index truoc roi chon index do trong KB.
8. Create KB.
9. Sync data source.
10. Test retrieve/query trong Bedrock console.
11. Ghi lai Knowledge Base ID de set vao Lambda env:
    - `KB_ID=<bedrock-kb-id>`

Notes:

- Current Lambda `askDocsBot` dang goi Bedrock Knowledge Base, nen neu KB ID sai/mat thi API Gateway/auth van OK nhung chatbot se return error.
- File `w5-source/lambdas/iam-policies/kb-config.json` chi la config tham khao tu setup hien tai, can thay account/region/resource ARN theo moi truong moi.

### A8. AI Lambdas

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

### A9. REST API Gateway + Usage Plan

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

### A10. Frontend deploy

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

## 5. Deploy version B - AWS CLI without CloudFormation

Dung cach nay khi muon deploy repeatable hon Console, nhung van khong dung CloudFormation. CLI commands ben duoi tao resource theo thu tu tuong tu Console.

### B1. Network foundation

Van dung Terraform repo nay cho buoc dau:

```bash
terraform init
terraform validate
terraform plan -out tfplan
terraform apply tfplan
terraform output
```

Lay outputs VPC/subnet/route table de dung cho cac lenh AWS CLI tiep theo.

### B2. Common variables

Set bien moi truong local de tranh go sai ID:

```powershell
$Region = "us-east-1"
$Project = "taskio-w5"
$AppVpcId = "<application-vpc-id>"
$PublicSubnetA = "<public-subnet-a>"
$PublicSubnetB = "<public-subnet-b>"
$PrivateSubnetA = "<private-subnet-a>"
$PrivateSubnetB = "<private-subnet-b>"
$ArtifactBucket = "<artifact-bucket>"
$DomainOrigin = "https://taskio.nigga.in.net"
```

### B3. Security groups

```powershell
$AlbSgId = aws ec2 create-security-group `
  --region $Region `
  --group-name "$Project-alb-sg" `
  --description "TaskIO W5 public ALB" `
  --vpc-id $AppVpcId `
  --query "GroupId" `
  --output text

aws ec2 authorize-security-group-ingress `
  --region $Region `
  --group-id $AlbSgId `
  --protocol tcp `
  --port 80 `
  --cidr 0.0.0.0/0

$AppSgId = aws ec2 create-security-group `
  --region $Region `
  --group-name "$Project-app-sg" `
  --description "TaskIO W5 backend EC2" `
  --vpc-id $AppVpcId `
  --query "GroupId" `
  --output text

aws ec2 authorize-security-group-ingress `
  --region $Region `
  --group-id $AppSgId `
  --protocol tcp `
  --port 8017 `
  --source-group $AlbSgId

$EfsSgId = aws ec2 create-security-group `
  --region $Region `
  --group-name "$Project-efs-sg" `
  --description "TaskIO W5 EFS" `
  --vpc-id $AppVpcId `
  --query "GroupId" `
  --output text

aws ec2 authorize-security-group-ingress `
  --region $Region `
  --group-id $EfsSgId `
  --protocol tcp `
  --port 2049 `
  --source-group $AppSgId
```

### B4. EFS

```powershell
$EfsId = aws efs create-file-system `
  --region $Region `
  --encrypted `
  --performance-mode generalPurpose `
  --throughput-mode bursting `
  --tags Key=Name,Value="$Project-exports" `
  --query "FileSystemId" `
  --output text

aws efs create-mount-target `
  --region $Region `
  --file-system-id $EfsId `
  --subnet-id $PrivateSubnetA `
  --security-groups $EfsSgId

aws efs create-mount-target `
  --region $Region `
  --file-system-id $EfsId `
  --subnet-id $PrivateSubnetB `
  --security-groups $EfsSgId
```

### B5. DocumentDB by CLI or Console

DocumentDB co nhieu setting network/secret nen co the tao bang Console cho nhanh. Neu dung CLI, flow toi thieu:

```powershell
$DocDbSubnetGroup = "$Project-docdb-subnet-group"
$DocDbSgId = aws ec2 create-security-group `
  --region $Region `
  --group-name "$Project-documentdb-sg" `
  --description "TaskIO W5 DocumentDB" `
  --vpc-id $AppVpcId `
  --query "GroupId" `
  --output text

aws ec2 authorize-security-group-ingress `
  --region $Region `
  --group-id $DocDbSgId `
  --protocol tcp `
  --port 27017 `
  --source-group $AppSgId

aws docdb create-db-subnet-group `
  --region $Region `
  --db-subnet-group-name $DocDbSubnetGroup `
  --db-subnet-group-description "TaskIO W5 DocumentDB private subnets" `
  --subnet-ids $PrivateSubnetA $PrivateSubnetB

aws docdb create-db-cluster `
  --region $Region `
  --db-cluster-identifier "$Project-docdb" `
  --engine docdb `
  --master-username <username> `
  --master-user-password <password> `
  --db-subnet-group-name $DocDbSubnetGroup `
  --vpc-security-group-ids $DocDbSgId `
  --storage-encrypted

aws docdb create-db-instance `
  --region $Region `
  --db-instance-identifier "$Project-docdb-1" `
  --db-cluster-identifier "$Project-docdb" `
  --engine docdb `
  --db-instance-class db.t3.medium
```

After cluster is available, get endpoint:

```powershell
$DocDbEndpoint = aws docdb describe-db-clusters `
  --region $Region `
  --db-cluster-identifier "$Project-docdb" `
  --query "DBClusters[0].Endpoint" `
  --output text
```

Create Secrets Manager secret for Lambda:

```powershell
$DocDbUri = "mongodb://<username>:<password>@$DocDbEndpoint`:27017/taskio?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
aws secretsmanager create-secret `
  --region $Region `
  --name "$Project/documentdb" `
  --secret-string "{`"uri`":`"$DocDbUri`",`"database`":`"taskio`"}"
```

Use `$DocDbUri` in backend `api.env` as `MONGODB_URI`.

### B6. Package backend and store env

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

aws s3 mb "s3://$ArtifactBucket" --region $Region
aws s3 cp $zip "s3://$ArtifactBucket/backend/taskio-api.zip" --region $Region

aws ssm put-parameter `
  --region $Region `
  --name /taskio/w5/api-env `
  --type SecureString `
  --value file://api.env `
  --overwrite
```

### B7. Backend IAM role and instance profile

```powershell
@'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
'@ | Set-Content .\ec2-trust.json -Encoding ascii

aws iam create-role `
  --role-name "$Project-ec2-role" `
  --assume-role-policy-document file://ec2-trust.json

aws iam attach-role-policy `
  --role-name "$Project-ec2-role" `
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

@"
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["s3:GetObject"], "Resource": "arn:aws:s3:::$ArtifactBucket/backend/*" },
    { "Effect": "Allow", "Action": ["ssm:GetParameter"], "Resource": "*" },
    { "Effect": "Allow", "Action": ["kms:Decrypt"], "Resource": "*" },
    { "Effect": "Allow", "Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"], "Resource": "*" }
  ]
}
"@ | Set-Content .\backend-inline-policy.json -Encoding ascii

aws iam put-role-policy `
  --role-name "$Project-ec2-role" `
  --policy-name "$Project-backend-inline" `
  --policy-document file://backend-inline-policy.json

aws iam create-instance-profile --instance-profile-name "$Project-ec2-profile"
aws iam add-role-to-instance-profile --instance-profile-name "$Project-ec2-profile" --role-name "$Project-ec2-role"
```

### B8. Backend ALB, launch template, ASG

Tao user data file `backend-user-data.sh`. Gia tri `$EfsId`, `$ArtifactBucket`, region va env parameter can thay dung truoc khi tao launch template.

```bash
#!/bin/bash
set -eux
dnf update -y
dnf install -y nodejs npm unzip amazon-efs-utils redis6
mkdir -p /mnt/taskio-shared/exports /opt/taskio-api
mount -t efs -o tls EFS_ID:/ /mnt/taskio-shared
echo "EFS_ID:/ /mnt/taskio-shared efs _netdev,tls 0 0" >> /etc/fstab
aws s3 cp s3://ARTIFACT_BUCKET/backend/taskio-api.zip /tmp/taskio-api.zip --region us-east-1
unzip -o /tmp/taskio-api.zip -d /opt/taskio-api
aws ssm get-parameter --name /taskio/w5/api-env --with-decryption --query Parameter.Value --output text --region us-east-1 > /opt/taskio-api/.env
cd /opt/taskio-api
npm ci
npm run build
cat >/etc/systemd/system/taskio-api.service <<'EOF'
[Unit]
Description=TaskIO API
After=network.target

[Service]
WorkingDirectory=/opt/taskio-api
EnvironmentFile=/opt/taskio-api/.env
ExecStart=/usr/bin/node build/src/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl enable --now redis6
systemctl enable --now taskio-api
```

Create load balancer, target group, launch template, ASG:

```powershell
$AlbArn = aws elbv2 create-load-balancer `
  --region $Region `
  --name "$Project-api-alb" `
  --subnets $PublicSubnetA $PublicSubnetB `
  --security-groups $AlbSgId `
  --query "LoadBalancers[0].LoadBalancerArn" `
  --output text

$TgArn = aws elbv2 create-target-group `
  --region $Region `
  --name "$Project-api-tg" `
  --protocol HTTP `
  --port 8017 `
  --vpc-id $AppVpcId `
  --health-check-path /api/v1/health `
  --target-type instance `
  --query "TargetGroups[0].TargetGroupArn" `
  --output text

aws elbv2 create-listener `
  --region $Region `
  --load-balancer-arn $AlbArn `
  --protocol HTTP `
  --port 80 `
  --default-actions Type=forward,TargetGroupArn=$TgArn

$AmiId = aws ssm get-parameter `
  --region $Region `
  --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 `
  --query "Parameter.Value" `
  --output text

(Get-Content .\backend-user-data.sh) `
  -replace "EFS_ID", $EfsId `
  -replace "ARTIFACT_BUCKET", $ArtifactBucket |
  Set-Content .\backend-user-data.rendered.sh -Encoding ascii

$UserData = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path .\backend-user-data.rendered.sh)))

@"
{
  "ImageId": "$AmiId",
  "InstanceType": "t3.micro",
  "IamInstanceProfile": { "Name": "$Project-ec2-profile" },
  "SecurityGroupIds": ["$AppSgId"],
  "UserData": "$UserData"
}
"@ | Set-Content .\launch-template-data.json -Encoding ascii

$LtId = aws ec2 create-launch-template `
  --region $Region `
  --launch-template-name "$Project-backend-lt" `
  --launch-template-data file://launch-template-data.json `
  --query "LaunchTemplate.LaunchTemplateId" `
  --output text

aws autoscaling create-auto-scaling-group `
  --region $Region `
  --auto-scaling-group-name "$Project-backend-asg" `
  --launch-template "LaunchTemplateId=$LtId,Version=`$Latest" `
  --min-size 1 `
  --max-size 2 `
  --desired-capacity 1 `
  --vpc-zone-identifier "$PrivateSubnetA,$PrivateSubnetB" `
  --target-group-arns $TgArn
```

### B9. Bedrock Knowledge Base for docs chatbot by CLI

Neu team deploy bang CLI, van co the tao KB bang Console cho nhanh. Neu can CLI, flow toi thieu la:

1. Upload docs AI cua anh Tien vao S3:

```powershell
$DocsBucket = "taskio-w5-ai-docs-<account-id>"
$DocsPrefix = "docs/"
aws s3 mb "s3://$DocsBucket" --region $Region
aws s3 sync ".\ai-docs" "s3://$DocsBucket/$DocsPrefix" --region $Region
```

2. Tao/confirm vector store theo option account ho tro.

- Neu lab/account co S3 Vectors, tao vector bucket/index va dung ARN index trong KB config.
- Neu account dung OpenSearch Serverless, tao collection/index va cap quyen cho Bedrock role.
- Phan nay co the lam tren Console de tranh sai IAM/vector policy.

3. Tao Bedrock KB role:

- Trust principal: `bedrock.amazonaws.com`.
- Permission toi thieu:
  - Read S3 docs bucket.
  - Write/read vector store.
  - Invoke embedding model.

4. Tao Knowledge Base:

```powershell
aws bedrock-agent create-knowledge-base `
  --region $Region `
  --cli-input-json file://kb-config.json
```

5. Tao data source cho S3 docs bucket:

```powershell
aws bedrock-agent create-data-source `
  --region $Region `
  --knowledge-base-id <bedrock-kb-id> `
  --name taskio-docs-s3 `
  --data-source-configuration "type=S3,s3Configuration={bucketArn=arn:aws:s3:::$DocsBucket,inclusionPrefixes=[$DocsPrefix]}"
```

6. Start ingestion/sync:

```powershell
aws bedrock-agent start-ingestion-job `
  --region $Region `
  --knowledge-base-id <bedrock-kb-id> `
  --data-source-id <data-source-id>
```

7. Lay Knowledge Base ID va set vao Lambda env:

```text
KB_ID=<bedrock-kb-id>
```

Note: `w5-source/lambdas/iam-policies/kb-config.json` la reference config. Khong dung y nguyen ARN account cu; thay role ARN, embedding model region, vector index ARN theo environment moi.

### B10. Package and upload Lambdas

```powershell
tar -a -cf E:\bomb\taskio-ai-lambdas\jwtAuthorizer.zip -C E:\bomb\taskio-ai-lambdas\jwtAuthorizer .
tar -a -cf E:\bomb\taskio-ai-lambdas\askDocsBot.zip -C E:\bomb\taskio-ai-lambdas\askDocsBot .
tar -a -cf E:\bomb\taskio-ai-lambdas\summarizeWorkspace.zip -C E:\bomb\taskio-ai-lambdas\summarizeWorkspace .

aws s3 cp E:\bomb\taskio-ai-lambdas\jwtAuthorizer.zip "s3://$ArtifactBucket/lambda/jwtAuthorizer.zip" --region $Region
aws s3 cp E:\bomb\taskio-ai-lambdas\askDocsBot.zip "s3://$ArtifactBucket/lambda/askDocsBot.zip" --region $Region
aws s3 cp E:\bomb\taskio-ai-lambdas\summarizeWorkspace.zip "s3://$ArtifactBucket/lambda/summarizeWorkspace.zip" --region $Region
```

### B11. Lambda IAM roles and functions

Tao IAM roles theo Console section A8 hoac dung policy JSON trong `w5-source/lambdas/iam-policies/`.

Create/update functions:

```powershell
aws lambda create-function `
  --region $Region `
  --function-name "$Project-jwtAuthorizer" `
  --runtime nodejs20.x `
  --handler index.handler `
  --role <authorizer-role-arn> `
  --code "S3Bucket=$ArtifactBucket,S3Key=lambda/jwtAuthorizer.zip" `
  --timeout 10 `
  --memory-size 128

aws lambda create-function `
  --region $Region `
  --function-name "$Project-askDocsBot" `
  --runtime nodejs20.x `
  --handler index.handler `
  --role <ai-lambda-role-arn> `
  --code "S3Bucket=$ArtifactBucket,S3Key=lambda/askDocsBot.zip" `
  --timeout 30 `
  --memory-size 512 `
  --environment "Variables={KB_ID=<bedrock-kb-id>,MODEL_ARN=<bedrock-model-or-inference-profile-arn>}"

aws lambda create-function `
  --region $Region `
  --function-name "$Project-summarizeWorkspace" `
  --runtime nodejs20.x `
  --handler index.handler `
  --role <ai-lambda-role-arn> `
  --code "S3Bucket=$ArtifactBucket,S3Key=lambda/summarizeWorkspace.zip" `
  --timeout 30 `
  --memory-size 512 `
  --environment "Variables={MONGO_SECRET_ARN=<mongo-secret-arn>,MODEL_ARN=<bedrock-model-or-inference-profile-arn>}"
```

### B12. REST API Gateway + Usage Plan

Generate an API key value:

```powershell
$key = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
Set-Content -LiteralPath .\ai-rest-api-key.txt -Value $key -Encoding ascii
```

Deploy:

```powershell
$ApiId = aws apigateway create-rest-api `
  --region $Region `
  --name "$Project-ai-rest-api" `
  --endpoint-configuration types=REGIONAL `
  --query "id" `
  --output text

$RootId = aws apigateway get-resources `
  --region $Region `
  --rest-api-id $ApiId `
  --query "items[?path=='/'].id" `
  --output text

$AiId = aws apigateway create-resource --region $Region --rest-api-id $ApiId --parent-id $RootId --path-part ai --query id --output text
$DocsId = aws apigateway create-resource --region $Region --rest-api-id $ApiId --parent-id $AiId --path-part docs --query id --output text
$AskId = aws apigateway create-resource --region $Region --rest-api-id $ApiId --parent-id $DocsId --path-part ask --query id --output text
$WorkspacesId = aws apigateway create-resource --region $Region --rest-api-id $ApiId --parent-id $AiId --path-part workspaces --query id --output text
$WorkspaceId = aws apigateway create-resource --region $Region --rest-api-id $ApiId --parent-id $WorkspacesId --path-part "{workspaceId}" --query id --output text
$SummaryId = aws apigateway create-resource --region $Region --rest-api-id $ApiId --parent-id $WorkspaceId --path-part summary --query id --output text

$AccountId = aws sts get-caller-identity --query Account --output text
$AuthorizerUri = "arn:aws:apigateway:$Region`:lambda:path/2015-03-31/functions/arn:aws:lambda:$Region`:$AccountId`:function:$Project-jwtAuthorizer/invocations"
$AuthorizerId = aws apigateway create-authorizer `
  --region $Region `
  --rest-api-id $ApiId `
  --name "$Project-jwt-authorizer" `
  --type TOKEN `
  --identity-source method.request.header.Authorization `
  --authorizer-uri $AuthorizerUri `
  --query id `
  --output text

foreach ($ResourceId in @($AskId, $SummaryId)) {
  aws apigateway put-method `
    --region $Region `
    --rest-api-id $ApiId `
    --resource-id $ResourceId `
    --http-method POST `
    --authorization-type CUSTOM `
    --authorizer-id $AuthorizerId `
    --api-key-required
}

$AskUri = "arn:aws:apigateway:$Region`:lambda:path/2015-03-31/functions/arn:aws:lambda:$Region`:$AccountId`:function:$Project-askDocsBot/invocations"
$SummaryUri = "arn:aws:apigateway:$Region`:lambda:path/2015-03-31/functions/arn:aws:lambda:$Region`:$AccountId`:function:$Project-summarizeWorkspace/invocations"

aws apigateway put-integration --region $Region --rest-api-id $ApiId --resource-id $AskId --http-method POST --type AWS_PROXY --integration-http-method POST --uri $AskUri
aws apigateway put-integration --region $Region --rest-api-id $ApiId --resource-id $SummaryId --http-method POST --type AWS_PROXY --integration-http-method POST --uri $SummaryUri

aws lambda add-permission --region $Region --function-name "$Project-jwtAuthorizer" --statement-id apigw-authorizer --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$Region`:$AccountId`:$ApiId/*/*"
aws lambda add-permission --region $Region --function-name "$Project-askDocsBot" --statement-id apigw-ask --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$Region`:$AccountId`:$ApiId/*/POST/ai/docs/ask"
aws lambda add-permission --region $Region --function-name "$Project-summarizeWorkspace" --statement-id apigw-summary --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$Region`:$AccountId`:$ApiId/*/POST/ai/workspaces/*/summary"

aws apigateway create-deployment --region $Region --rest-api-id $ApiId --stage-name prod

$ApiKeyValue = Get-Content .\ai-rest-api-key.txt
$ApiKeyId = aws apigateway create-api-key --region $Region --name "$Project-browser-key" --enabled --value $ApiKeyValue --query id --output text
$UsagePlanId = aws apigateway create-usage-plan `
  --region $Region `
  --name "$Project-ai-rest-usage-plan" `
  --throttle burstLimit=10,rateLimit=5 `
  --quota limit=1000,period=MONTH `
  --api-stages "apiId=$ApiId,stage=prod" `
  --query id `
  --output text
aws apigateway create-usage-plan-key --region $Region --usage-plan-id $UsagePlanId --key-id $ApiKeyId --key-type API_KEY
```

Get outputs:

```powershell
"https://$ApiId.execute-api.$Region.amazonaws.com/prod"
```

Note: CORS `OPTIONS` co the tao bang Console de nhanh hon, hoac bang CLI `put-method/put-integration` mock response. Can allow:

- Origin: `https://taskio.nigga.in.net`
- Headers: `authorization,content-type,x-api-key`
- Methods: `POST,OPTIONS`

### B13. Update frontend

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

## 6. CloudFormation reference only

Thu muc `w5-cloudformation/` duoc giu lai de team doi chieu resource/config, khong phai deploy path chinh.

Reference files:

- `cloudformation/w5-backend.yaml`: backend ALB, Target Group, Launch Template, ASG, EC2 IAM role, EFS mount in user data.
- `cloudformation/w5-ai-api.yaml`: Lambda runtime, authorizer, AI lambdas, SQS failure queue.
- `cloudformation/w5-ai-rest-api.yaml`: REST API Gateway, Lambda authorizer, API Key, Usage Plan, access logs.
- `cloudformation/w5-foundation.all-in-one.yaml`: all-in-one validation template da dung de test nhanh; file nay tao VPC rieng nen khong dung cho flow chuan voi Terraform foundation.

## 7. Verification commands

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

## 8. Known notes

- REST API Usage Plan works by API key. In a browser SPA, API key is visible in network/bundle, so it is not a strong secret.
- API key + Usage Plan is useful for Gateway-level throttling/quota.
- True per-user or per-workspace quota should still be implemented in DB using JWT `userId`/workspace subscription.
- Current DB already has `subscriptions.planFeatureSnapshot.limits`, but does not yet have an AI usage counter collection.
- Suggested future collection: `aiUsageCounters`.
- `askDocsBot` currently depends on a valid Bedrock Knowledge Base ID. If KB ID is missing/deleted, gateway/auth layer works but Lambda returns internal error.
- Bedrock KB docs source is owned by anh Tien in the current team flow; pull those docs before sync/ingestion.
- Database path is AWS DocumentDB in private subnets. Backend reads it through `MONGODB_URI`; `summarizeWorkspace` reads it through Secrets Manager and needs VPC access if connecting directly.

## 9. Recommended message to team

Repo nay la buoc network foundation bang Terraform. Sau khi VPC/Peering xong, team deploy expanded W5 layer bang AWS Console hoac AWS CLI, khong lay CloudFormation lam path chinh. CloudFormation chi giu lai de tham khao resource/config. Backend chay EC2 private subnet sau ALB, DocumentDB nam private subnet lam database, EFS dung lam shared temporary storage cho workspace export. AI dung Bedrock KB + Lambda sau REST API Gateway co API Key + Usage Plan.
