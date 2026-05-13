# AWS Architecture Design — Taskio

**Date:** 2026-04-08
**App:** Taskio — Trello-like task management SPA (React + Vite)
**Stack:** React + Vite (frontend) · Node.js + Socket.io (backend) · DynamoDB + ElastiCache (data)
**Target region:** ap-southeast-1 (Singapore)
**Goal:** Production-grade, multi-AZ, fault-tolerant deployment

---

## Table of Contents

1. [Account & Organization Structure](#1-account--organization-structure)
2. [VPC & Network Topology](#2-vpc--network-topology)
3. [Frontend Layer](#3-frontend-layer)
4. [Application-to-AWS Mapping](#4-application-to-aws-mapping)
5. [Backend Layer — Routing Decision](#5-backend-layer--routing-decision)
6. [ALB Configuration](#6-alb-configuration)
7. [ECS Fargate](#7-ecs-fargate)
8. [Data Layer](#8-data-layer)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Observability & Security](#10-observability--security)
11. [Architecture Diagram Guide](#11-architecture-diagram-guide)
12. [Key Trade-off Decisions](#12-key-trade-off-decisions)

---

## 1. Account & Organization Structure

```
AWS Organizations (Management Account)
├── dev account     — engineers iterate freely, no prod access
├── staging account — mirrors prod topology, used for pre-release testing
└── prod account    — locked down IAM, SCPs prevent accidental destruction
```

Each account has its own VPC, ECR repository, and CloudWatch log groups.

**Service Control Policies (SCPs) on prod account:**

- Deny `ec2:TerminateInstances` without MFA
- Deny disabling CloudTrail or GuardDuty
- Restrict deployable regions to `ap-southeast-1`

**Cross-account CI/CD:**
CodePipeline in the staging account assumes a cross-account IAM role in the prod account.
Role is scoped to `ecs:UpdateService` and `codedeploy:*` only (principle of least privilege).
A manual approval gate in the pipeline separates staging deploy from prod deploy.

---

## 2. VPC & Network Topology

```
VPC: 10.0.0.0/16  (one per account)
│
├── AZ-1 (ap-southeast-1a)
│   ├── Public Subnet  10.0.1.0/24   ← ALB nodes, NAT Gateway
│   └── Private Subnet 10.0.3.0/24   ← ECS tasks, ElastiCache nodes
│
└── AZ-2 (ap-southeast-1b)
    ├── Public Subnet  10.0.2.0/24   ← ALB nodes, NAT Gateway
    └── Private Subnet 10.0.4.0/24   ← ECS tasks, ElastiCache nodes
```

**Traffic flow:**

```
Internet → IGW → ALB (public subnets) → ECS tasks (private subnets)
ECS tasks → NAT Gateway (public subnet) → IGW → Internet (outbound only)
```

**Design decisions:**

- Internet-facing ALB nodes must be in public subnets — AWS hard requirement
- ECS tasks and ElastiCache never have public IPs
- One NAT Gateway per AZ — a shared NAT Gateway is a hidden single point of failure; if AZ-1 fails, AZ-2 tasks lose outbound internet

**Security Groups:**

| SG               | Inbound                | Outbound                                      |
| ---------------- | ---------------------- | --------------------------------------------- |
| `sg-alb`         | 443 from `0.0.0.0/0`   | app port to `sg-ecs` only                     |
| `sg-ecs`         | app port from `sg-alb` | `sg-elasticache` (6379), `sg-vpce` (443), NAT |
| `sg-elasticache` | 6379 from `sg-ecs`     | none                                          |
| `sg-vpce`        | 443 from `sg-ecs`      | none                                          |

**VPC Endpoints** (keeps traffic off internet, reduces NAT cost):

| Endpoint   | Type           | Purpose                                 |
| ---------- | -------------- | --------------------------------------- |
| `dynamodb` | Gateway (free) | ECS → DynamoDB without NAT              |
| `s3`       | Gateway (free) | ECR stores image layers in S3           |
| `ecr.api`  | Interface      | ECR API calls from ECS tasks            |
| `ecr.dkr`  | Interface      | Docker image pulls from ECR             |
| `ecs`      | Interface      | ECS agent ↔ control plane communication |
| `logs`     | Interface      | CloudWatch Logs from ECS tasks          |

---

## 3. Frontend Layer

```
User
 └── Route53 (app.taskio.com — A record alias to CloudFront)
      └── CloudFront distribution
           ├── WAF WebACL: waf-cloudfront (scope: CLOUDFRONT, must be in us-east-1)
           ├── Origin: S3 bucket (static React build)
           │    └── Origin Access Control (OAC) — bucket is fully private
           └── Cognito User Pool (auth identity store)
```

**S3 bucket:**

- Static hosting: disabled
- Public access: blocked entirely
- Bucket policy: allows `s3:GetObject` from CloudFront distribution ARN only (OAC)
- Nobody can hit `s3.amazonaws.com/your-bucket/index.html` directly

**CloudFront configuration:**

- Default root object: `index.html`
- Error responses: 403 and 404 → `/index.html` with HTTP 200
  _(Required for React Router — a direct URL like `/boards/123` would otherwise return 403 from S3)_
- Cache behaviors:
  - `/assets/*` — TTL 1 year (Vite outputs content-hashed filenames, safe to cache aggressively)
  - `/index.html` — `Cache-Control: no-store` (deploys propagate immediately)
- HTTPS only; HTTP → HTTPS redirect enforced at listener level

**WAF WebACL `waf-cloudfront` (scope: CLOUDFRONT):**

- `AWSManagedRulesCommonRuleSet` — OWASP Top 10, SQLi, XSS
- `AWSManagedRulesKnownBadInputsRuleSet` — log4j, Spring4Shell, etc.
- `AWSManagedRulesAmazonIpReputationList` — known malicious IPs
- Rate-based rule: 2000 req / 5 min per IP (blanket)

**Cognito User Pool:**

- Used as identity store — registration, login, email verification, forgot password
- Custom login UI (Taskio's own React login form, not Cognito hosted UI)
- JWT tokens (access + refresh) issued by Cognito, passed as `Authorization: Bearer` to ALB
- Token verification in Node.js backend via Cognito JWKS endpoint

---

## 4. Application-to-AWS Mapping

Before diving into the backend routing details, here's how each piece of
Taskio's actual codebase lands on an AWS service. This is the literal
code → infrastructure correspondence.

| Taskio code                                      | Build artifact                                           | Lands on                                                                       |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `taskio-web/` React + Vite SPA                   | `dist/` (static HTML/JS/CSS)                             | **S3 bucket** → served via **CloudFront**                                      |
| `taskio-api/` Node monolith                      | Docker image (one `node:20-alpine` container)            | **ECR** → pulled by **ECS Fargate task**                                       |
| Express routes `/v1/boards`, `/v1/users/*`, etc. | Same process, same port                                  | **ALB** listener rule `/v1/*` → ECS target group                               |
| `socket.io` server                               | Same process, same port, shares HTTP server with Express | **ALB** listener rule `/socket.io/*` → same ECS target group (sticky sessions) |
| `@socket.io/redis-adapter`                       | Redis client inside the container                        | **ElastiCache** (pub/sub channels)                                             |
| Session store / rate-limit counters              | Redis client inside the container                        | **ElastiCache** (cache keys, same cluster)                                     |
| Mongoose models (`boardModel`, `cardModel`, ...) | AWS SDK `DynamoDBDocumentClient`                         | **DynamoDB** tables                                                            |
| File uploads (attachments, avatars)              | AWS SDK S3 client                                        | **S3 bucket** (separate from SPA hosting bucket)                               |
| Secrets (`JWT_SECRET`, `REDIS_URL`, ...)         | `process.env.*` injected at task start                   | **Secrets Manager** → ECS task definition `secrets` block                      |
| App logs (`console.log`, pino, etc.)             | stdout/stderr from the container                         | **CloudWatch Logs** via `awslogs` driver                                       |

### Key observation: the backend is one Docker image

The entire `taskio-api` repo builds into **a single container**. That container
runs Express + Socket.io in one Node process listening on one port (3001).
The ALB sends both HTTP API calls and WebSocket upgrades to the same target
group — the Node process disambiguates by path internally (Express router for
`/v1/*`, Socket.io handler for `/socket.io/*`).

This is a monolith, and it's a deliberate choice. See Section 7 for why a
monolith is a natural fit for ECS Fargate (they are orthogonal concerns —
ECS does not require microservices), and Section 12 for the monolith-vs-
microservices trade-off decision.

---

## 5. Backend Layer — Routing Decision

### Why not API Gateway

API Gateway WebSocket API translates WebSocket connections to HTTP before forwarding
to the backend. This breaks Socket.io's HTTP long-polling → WebSocket upgrade handshake.
Socket.io cannot be used with API Gateway without:

1. Forcing `transports: ['websocket']` only (breaks fallback on restricted networks)
2. Splitting REST and Socket.io into separate services

Neither option is acceptable. API Gateway is not suitable for this app.

### Why not CloudFront VPC Origins for the ALB

CloudFront VPC Origins (launched Nov 2024) allow an ALB to live in a private subnet
with no public IP — a significant security improvement. However, as of March 2025,
**CloudFront VPC Origins do not support WebSocket**. AWS has confirmed this limitation.
Since Socket.io requires WebSocket (with long-polling fallback), the ALB must remain
internet-facing. Monitor this limitation — if AWS adds WebSocket support to VPC Origins,
migrating to a private ALB would be the preferred upgrade.

### Chosen approach: Separate domains, WAF on ALB

```
app.taskio.com  → Route53 → CloudFront (WAF: waf-cloudfront) → S3
api.taskio.com  → Route53 → WAF (waf-alb-api) → public ALB (multi-AZ) → ECS Fargate (private)
```

- ALB is internet-facing, nodes in public subnets — AWS requirement for internet-facing ALBs
- ECS tasks in private subnets, no public IPs, never directly reachable
- ALB handles both REST (`/v1/*`) and Socket.io (`/socket.io/*`) natively — no special config required
- CORS configured once on the Node.js backend (`app.taskio.com` allowed origin)

---

## 6. ALB Configuration

**Listeners:**

- Port 80 HTTP → redirect rule to HTTPS 443 (no traffic served over HTTP)
- Port 443 HTTPS → forward to target group `tg-blue` (live production)
- Port 8443 HTTPS → forward to target group `tg-green` (CodeDeploy test traffic only)

**Target group settings:**

| Setting               | Value                  | Reason                                                       |
| --------------------- | ---------------------- | ------------------------------------------------------------ |
| Target type           | IP                     | Required for Fargate — tasks register by IP, not instance ID |
| Protocol              | HTTP                   | ALB terminates TLS, talks HTTP internally to ECS             |
| Health check path     | `GET /v1/health` → 200 | Backend must expose this endpoint                            |
| Health check interval | 30s                    |                                                              |
| Healthy threshold     | 2 consecutive checks   |                                                              |
| Unhealthy threshold   | 3 consecutive checks   |                                                              |
| Stickiness type       | `lb_cookie`            |                                                              |
| Stickiness duration   | 86400s (1 day)         |                                                              |

**Why sticky sessions AND a Redis adapter?**

These solve different problems:

- **Redis adapter** — ensures Socket.io events emitted on Task-1 are broadcast to clients
  connected to Task-2. Handles cross-task fan-out.
- **Sticky sessions** — ensures a single client's HTTP long-polling requests during the
  WebSocket upgrade handshake all land on the same task. Without this, clients on
  corporate proxies or restrictive networks (which block WebSocket) cannot connect.

Both are required. Neither alone is sufficient.

**ALB access logs:** enabled → S3 bucket, 90-day retention,
S3 lifecycle rule moves to Glacier after 30 days.

**WAF WebACL `waf-alb-api` (scope: REGIONAL, ap-southeast-1):**

- Same managed rule groups as `waf-cloudfront`
- Custom rate-based rules per IP:

| Endpoint             | Limit            | Reason                         |
| -------------------- | ---------------- | ------------------------------ |
| `/v1/users/login`    | 100 req / 5 min  | Credential stuffing protection |
| `/v1/users/register` | 20 req / 5 min   | Account creation abuse         |
| `/v1/users/forgot_*` | 10 req / 5 min   | Email flooding prevention      |
| Everything else      | 2000 req / 5 min | General abuse protection       |

---

## 7. ECS Fargate

### Why the Taskio monolith fits ECS cleanly

A common mental trap: _"containers → ECS → microservices."_ That chain is
false. ECS does not care about your code structure — it cares about
containers. A monolith Docker image is a perfectly valid ECS task.

ECS only requires six things from the app inside the container. Taskio
already satisfies all of them:

| Requirement                                                                                                           | Taskio status                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Be packageable as a Docker image                                                                                      | ✅ one `Dockerfile` in `taskio-api/`                                                                                              |
| Listen on a declared port                                                                                             | ✅ port 3001 in task definition                                                                                                   |
| Handle `SIGTERM` gracefully — close HTTP server, drain Socket.io connections, exit within `stopTimeout` (default 30s) | ⚠️ **verify** — Express does not handle SIGTERM by default; needs ~10 lines of shutdown code. Most common monolith footgun on ECS |
| Be stateless between requests OR externalize state                                                                    | ✅ sessions → ElastiCache, data → DynamoDB, uploads → S3                                                                          |
| Log to stdout/stderr (not files)                                                                                      | ✅ assumed pino/console                                                                                                           |
| Expose a health check endpoint (e.g., `GET /v1/health` → 200)                                                         | ⚠️ **add if missing** — used by ALB target group and ECS `healthCheck`                                                            |

Notice what is _not_ on this list: "be a microservice," "use gRPC," "have
fewer than N routes." A 50k-line Express app is as valid an ECS workload
as a 100-line Go service.

### How horizontal scaling works for a monolith

Your monolith scales the same way microservices do: **run more copies.**
With ECS service desired count = N, Fargate runs N independent copies of
the same container. ALB round-robins HTTP traffic, sticky sessions pin
WebSocket connections, and the Redis adapter fans out Socket.io events
across all N copies.

```
          ┌─ Task 1 (monolith copy) ─┐
ALB ──────┼─ Task 2 (monolith copy) ─┼──► ElastiCache (pub/sub broadcast)
          └─ Task 3 (monolith copy) ─┘             │
                                                   ▼
                                          all copies see all events
```

When user A (connected to Task 1) moves a card, Task 1 publishes
`card:moved` to Redis. Tasks 2 and 3 receive it via the adapter and push
it to their own connected users. The monolith has no idea it is running
in parallel — the adapter handles fan-out transparently.

### Where monoliths _do_ break on containers (monitor these)

- Writes to local filesystem expecting persistence (vanish on task restart)
- In-memory caches at module scope (`const cache = {}`) — inconsistent across replicas
- Long-running background jobs inside the HTTP process — consider a separate ECS service or EventBridge Scheduler + Lambda
- Startup time > 30s — slow scale-out, measure this
- Memory leaks — one leaky route taints the whole image; add a CloudWatch memory alarm with auto-restart

---

### Cluster & service configuration

**Cluster:** Fargate launch type only (no EC2 capacity providers).

**Service configuration:**

- Desired count: 2 minimum (one task per AZ — never run a single task in prod)
- Deployment type: Blue/Green via CodeDeploy
- Deployment circuit breaker: enabled (auto-rollback if new tasks fail health checks)
- Task placement: spread across AZs
- Auto Scaling: min 2 / max 10 tasks
  - Scale out: CPU > 70% for 2 consecutive minutes → add 1 task
  - Scale in: CPU < 30% for 5 consecutive minutes → remove 1 task

**Task definition:**

```json
{
  "family": "taskio-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "taskio-api",
      "image": "<IMAGE_URI>",
      "portMappings": [{ "containerPort": 3000 }],
      "secrets": [
        {
          "name": "REDIS_CACHE_URL",
          "valueFrom": "arn:aws:secretsmanager:...:REDIS_CACHE_URL"
        },
        {
          "name": "REDIS_SOCKET_URL",
          "valueFrom": "arn:aws:secretsmanager:...:REDIS_SOCKET_URL"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:...:JWT_SECRET"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/taskio-api",
          "awslogs-region": "ap-southeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/v1/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    },
    {
      "name": "xray-daemon",
      "image": "amazon/aws-xray-daemon",
      "portMappings": [{ "containerPort": 2000, "protocol": "udp" }],
      "cpu": 32,
      "memory": 256
    }
  ]
}
```

**IAM roles — two roles, different purposes:**

| Role                   | Who uses it                      | Permissions                                                |
| ---------------------- | -------------------------------- | ---------------------------------------------------------- |
| `ecsTaskExecutionRole` | ECS infrastructure               | Pull from ECR, write CloudWatch Logs, read Secrets Manager |
| `ecsTaskRole`          | Your application code at runtime | DynamoDB read/write on Taskio tables                       |

Do not conflate these. `ecsTaskExecutionRole` is the plumbing; `ecsTaskRole` is your app's identity.

---

## 8. Data Layer

### DynamoDB

**Capacity mode: On-Demand**
AWS significantly reduced on-demand pricing in November 2024. On-demand is now the
recommended default for variable workloads — you pay per request with no capacity planning,
no throttling risk, and no idle cost. Switch to provisioned + reserved capacity only after
you have stable traffic patterns and real usage data to forecast from.

**Production settings:**

| Setting                       | Value                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Capacity mode                 | On-demand                                                                               |
| Point-in-Time Recovery (PITR) | Enabled — 35-day restore window                                                         |
| Encryption at rest            | AWS-managed KMS (upgrade to CMK for compliance)                                         |
| DynamoDB Streams              | Enabled — enables future event-driven patterns (e.g. Lambda triggers for notifications) |
| Access path                   | Gateway VPC Endpoint — no NAT, no internet                                              |

**Table design:** Single-table design with composite keys (`PK`, `SK`) and GSIs per access
pattern is the advanced approach. Multi-table (one table per domain entity) is acceptable
and easier to migrate to from a document database.

### ElastiCache — naming note

AWS renamed the service to **Amazon ElastiCache for Valkey / Redis OSS** following Redis's
license change in 2024. Valkey is the open-source Redis fork maintained by the Linux Foundation.
Use **Redis OSS 7.x** — fully compatible with `ioredis`, `redis` npm packages, and
`@socket.io/redis-adapter`.

### ElastiCache #1 — Cache (API responses, sessions, rate limiting)

```
Name:           taskio-cache
Engine:         Redis OSS 7.x
Cluster mode:   DISABLED
Node type:      cache.t4g.medium (2 vCPU, 3.09 GB)
Topology:       1 primary (AZ-1) + 1 replica (AZ-2)
Multi-AZ:       enabled, automatic failover (~30s)
Subnet group:   private subnets AZ-1 + AZ-2
Encryption:     in-transit (TLS) + at-rest
Auth:           auth token stored in Secrets Manager, injected via task definition secrets
```

### ElastiCache #2 — Socket.io Adapter (pub/sub only)

```
Name:           taskio-socketio
Engine:         Redis OSS 7.x
Cluster mode:   DISABLED  ← @socket.io/redis-adapter does not support cluster mode
                             without using the cluster-specific adapter variant
Node type:      cache.t4g.small (lighter — only pub/sub payloads, no large data)
Topology:       1 primary (AZ-1) + 1 replica (AZ-2)
Multi-AZ:       enabled, automatic failover
Subnet group:   same as taskio-cache
```

**How the Socket.io adapter works at scale:**

```
Client A (connected to ECS Task-1) emits "card:update"
  → Task-1 publishes event to Redis pub/sub channel (taskio-socketio)
  → Task-2 is subscribed to same channel → receives the event
  → Task-2 broadcasts "card:update" to all its connected clients
Result: all clients see the update regardless of which ECS task they're connected to
```

Without this, a client connected to Task-2 would never receive events emitted by Task-1.

**Both ElastiCache clusters share the same subnet group:**

```
Subnet group: taskio-elasticache-subnet-group
  - subnet-private-az1 (10.0.3.0/24)
  - subnet-private-az2 (10.0.4.0/24)
```

This ensures primary and replica nodes are always in different AZs.

---

## 9. CI/CD Pipeline

```
GitHub (push to main branch)
  → CodePipeline V2 (Source: GitHub Version 2 via CodeStar Connections)
  → CodeBuild (Build: Docker image → ECR)
  → [Manual approval gate — staging → prod only]
  → CodeDeploy (Deploy: Blue/Green to ECS Fargate)
```

**CodePipeline V2** is the only pipeline type available in the console (V1 is legacy).
Use **GitHub Version 2** connection (CodeStar Connections OAuth) — the old GitHub V1
webhook method is deprecated.

### buildspec.yml

```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
      - IMAGE_TAG=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c1-8)
      - IMAGE_URI=$ECR_REGISTRY/$ECR_REPO:$IMAGE_TAG
  build:
    commands:
      - docker build -t $IMAGE_URI .
  post_build:
    commands:
      - docker push $IMAGE_URI
      - sed -i "s|<IMAGE_URI>|$IMAGE_URI|g" taskdef.json
      - printf '[{"name":"taskio-api","imageUri":"%s"}]' $IMAGE_URI > imagedefinitions.json
artifacts:
  files:
    - taskdef.json
    - appspec.yaml
    - imagedefinitions.json
```

Images are tagged with the **Git commit SHA** (first 8 chars), not `:latest`.
Every deployed image is traceable back to an exact commit.

### Blue/Green deployment flow

```
CodeDeploy creates Green task set → routes to ALB port 8443 (test listener)
  → AfterAllowTestTraffic hook: Lambda smoke test runs against Green environment
  → Smoke test passes → traffic shift begins: Canary10Percent5Minutes
      10% of production traffic → Green for 5 minutes
      CloudWatch alarm monitors 5xx error rate during bake window
      No alarms fire → 100% traffic shifts to Green, Blue task set terminated
      Alarm fires during bake window → automatic rollback to Blue (~60 seconds)
```

Traffic shifting strategy: **Canary10Percent5Minutes**

- 10% to Green for 5 min bake, then 100%
- Safe for a real-time app: limited blast radius if the new version is broken
- Instant rollback preserves Socket.io connections on Blue

### appspec.yaml

```yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: <TASK_DEFINITION>
        LoadBalancerInfo:
          ContainerName: 'taskio-api'
          ContainerPort: 3000
        PlatformVersion: 'LATEST'
Hooks:
  - AfterAllowTestTraffic: 'arn:aws:lambda:ap-southeast-1:ACCOUNT:function:taskio-smoke-test'
```

### ECR image lifecycle policy

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": { "type": "expire" }
    }
  ]
}
```

### CodeBuild IAM permissions required

```
ecr:GetAuthorizationToken
ecr:BatchCheckLayerAvailability
ecr:PutImage
ecr:InitiateLayerUpload
ecr:UploadLayerPart
ecr:CompleteLayerUpload
logs:CreateLogGroup
logs:CreateLogStream
logs:PutLogEvents
```

---

## 10. Observability & Security

### CloudWatch Container Insights — Enhanced Observability

Enable on the ECS cluster (single setting, no sidecar agent required — launched Dec 2024).
Automatically collects metrics at every level: cluster → service → task → container.
Pre-built dashboards in CloudWatch → Container Insights. Enables drill-down to identify
memory leaks in individual containers.

### CloudWatch Alarms

| Alarm                            | Threshold                | Action                     |
| -------------------------------- | ------------------------ | -------------------------- |
| ECS CPU > 70% for 2 min          | Scale out +1 task        | Auto Scaling policy        |
| ECS CPU < 30% for 5 min          | Scale in -1 task         | Auto Scaling policy        |
| ALB HTTP 5xx rate > 1%           | Alert                    | SNS → email / Slack        |
| ALB target response time > 2s    | Alert                    | SNS                        |
| CodeDeploy bake window 5xx spike | Any spike above baseline | Automatic rollback to Blue |

The CodeDeploy rollback alarm is critical — wire it to the Blue/Green deployment so that
any 5xx spike during the 5-minute bake window triggers automatic rollback.

### AWS X-Ray — Distributed Tracing

X-Ray daemon runs as a sidecar container in every ECS task (see task definition above).
Traces the full request path: ALB → ECS → DynamoDB → ElastiCache.
Integrated with CloudWatch Application Signals for SLO visibility.
Add the X-Ray SDK to the Node.js backend (`aws-xray-sdk-node`) to instrument routes.

### Log Querying — CloudWatch Logs Insights

ECS logs are in `/ecs/taskio-api`. Example query to find errors:

```sql
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 50
```

### Security

**Two WAF WebACLs — scope is mandatory:**

| WebACL           | Attached to | AWS Scope                                     |
| ---------------- | ----------- | --------------------------------------------- |
| `waf-cloudfront` | CloudFront  | `CLOUDFRONT` — must be created in `us-east-1` |
| `waf-alb-api`    | ALB         | `REGIONAL` — created in `ap-southeast-1`      |

**Secrets — use Secrets Manager, not SSM Parameter Store:**
Secrets Manager provides automatic rotation, cross-account access, and fine-grained
CloudTrail audit. The ECS task definition `secrets` field supports both services —
only the `valueFrom` ARN changes.

**AWS Shield Standard:** free, always enabled, protects ALB and CloudFront from
layer 3/4 DDoS automatically. Shield Advanced (~$3,000/month) is not required at this scale.

**CloudTrail:** enabled in every account, logs centralized to S3 in the management account.
Every API call across all three accounts (dev/staging/prod) is logged and retained.

**GuardDuty:** enabled in every account. Detects anomalous behavior — e.g. an ECS task
making unexpected outbound calls, credential exfiltration attempts. One-click to enable,
~$10–30/month at this scale. Non-negotiable for a production system.

---

## 11. Architecture Diagram Guide

### Tool

**draw.io (diagrams.net)** — free, official AWS shape library built-in, exports PNG/SVG.

**Loading the latest AWS icons:**

1. In draw.io, open the shape panel → search "AWS" → enable **AWS 19** (latest library)
2. Or download the quarterly icon pack from [aws.amazon.com/architecture/icons](https://aws.amazon.com/architecture/icons/)
   (released Q1: end of Jan, Q2: end of April, Q3: end of July)
3. Available formats: SVG, PowerPoint, draw.io XML, Figma (Release 18, Feb 2024)

**Do not recolor AWS icons manually** — use the library defaults. Official color palette:

- Orange = compute (ECS, EC2, Lambda)
- Purple = networking (VPC, ALB, Route53, CloudFront)
- Blue = storage (S3, DynamoDB)
- Red = security (WAF, Cognito, IAM, Shield)
- Green = management/devtools (CodePipeline, CodeBuild, CloudWatch)

### Grouping hierarchy — always nest in this order

```
AWS Cloud boundary (outermost rectangle)
  │
  ├── Global services (OUTSIDE region box)
  │   Route53 · CloudFront · WAF on CF · Cognito · IAM
  │
  └── Region: ap-southeast-1 (rectangle)
        │
        ├── Regional services (OUTSIDE VPC box)
        │   ALB · ECR · ECS Cluster · DynamoDB · ElastiCache
        │   CodePipeline · CodeBuild · S3 bucket · Secrets Manager
        │
        └── VPC (rectangle)
              │
              ├── AZ-1 (rectangle)
              │   ├── Public Subnet: ALB node, NAT Gateway
              │   └── Private Subnet: ECS task, ElastiCache node
              │
              └── AZ-2 (rectangle)
                  ├── Public Subnet: ALB node, NAT Gateway
                  └── Private Subnet: ECS task, ElastiCache node
```

### Arrow conventions

- **Solid arrow** = data flow / request path (label with protocol + port)
- **Dashed arrow** = management / control plane (CI/CD triggers, image pulls, SSM reads)
- Draw arrows in the direction traffic flows — avoid bidirectional arrows unless genuinely bidirectional
- Label every arrow: `HTTPS 443`, `Redis 6379`, `HTTP → HTTPS redirect`, `UDP 2000 (X-Ray)`

### Security Group boundaries

Draw a light dashed rectangle around resources that share a security group.
Label it `sg-ecs`, `sg-alb`, `sg-elasticache`. This is a detail most students omit
and mentors notice.

### Six layers to include in the diagram

1. **Frontend path:** User → Route53 → CloudFront → S3
2. **API path:** User → Route53 → WAF → ALB → ECS (show both AZs)
3. **Data path:** ECS → DynamoDB (via VPC endpoint, dashed) + ElastiCache x2
4. **Outbound path:** ECS → NAT Gateway → IGW → Internet
5. **CI/CD swim lane** (separate section below main diagram):
   GitHub → CodePipeline → CodeBuild → ECR → CodeDeploy → ECS
6. **Observability icons** (small, top-right corner):
   CloudWatch · X-Ray · CloudTrail · GuardDuty

### Add a legend

Small box in the corner:

- Solid arrow = request / data flow
- Dashed arrow = management / control plane
- Dashed rectangle = Security Group boundary

---

## 12. Key Trade-off Decisions

| Decision              | Chosen                               | Rejected                                      | Reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ------------------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Service decomposition | Monolith (single container image)    | Microservices (auth / board / realtime split) | Taskio has one bounded context — collaborative task boards. Splitting would add network hops, deploy coordination, and distributed tracing overhead to solve zero current problems. The monolith deploys as one immutable image, which is exactly the unit ECS Fargate scales. When a bounded context truly warrants its own deploy lifecycle (e.g. a billing service with PCI scope, or a heavy analytics worker), it splits out as a second ECS service sharing the same cluster, ALB, and pipeline. No replatforming required. |
| Compute platform      | ECS Fargate                          | EC2 + ASG (raw or Docker)                     | Fargate removes host patching, AMI baking, and Blue/Green orchestration burden. ~25% compute premium is worth it for a small team. Escape hatch: ECS-on-EC2 shares 95% of the control plane, so migrating compute layer later requires zero changes to task definitions, ECR, or CodeDeploy — only the capacity provider changes. Not locked in.                                                                                                                                                                                  |
| API routing layer     | ALB directly                         | API Gateway                                   | API Gateway WebSocket API breaks Socket.io upgrade handshake                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ALB exposure          | Public ALB (internet-facing)         | CloudFront VPC Origins                        | VPC Origins don't support WebSocket as of Mar 2025                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Domain structure      | Separate domains (`app.*` / `api.*`) | Single CloudFront domain                      | Avoids WebSocket header-forwarding footguns in CloudFront                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| DynamoDB capacity     | On-demand                            | Provisioned                                   | Post-Nov 2024 price cut makes on-demand preferred for variable traffic                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Redis cluster mode    | Disabled                             | Enabled                                       | `@socket.io/redis-adapter` requires cluster mode disabled                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Deployment strategy   | Blue/Green (CodeDeploy)              | Rolling update                                | Zero-downtime, automatic rollback on alarm, instant blue revert                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Secrets storage       | Secrets Manager                      | SSM Parameter Store                           | Auto-rotation, cross-account access, CloudTrail audit                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| NAT Gateway           | One per AZ (×2)                      | Single shared                                 | Prevents AZ-level single point of failure on outbound traffic                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ElastiCache Redis     | Two separate clusters                | One shared cluster                            | Separates concerns — cache TTL eviction policies won't interfere with pub/sub                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Pipeline type         | CodePipeline V2                      | CodePipeline V1                               | V1 is legacy; V2 is the only type in the console, has per-execution pricing                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
