# Taskio AWS Architecture — Defense Guide

Architecture defense Q&A, component explainer, big-picture flows, and known caveats.

---

## Table of Contents
- [Component Guide](#component-guide)
- [Big Picture Request Flows](#big-picture-request-flows)
- [Tier 1 Defense](#tier-1-defense)
- [Tier 2 Defense](#tier-2-defense)
- [Tier 3 Defense](#tier-3-defense)
- [CI/CD Defense](#cicd-defense)
- [Diagram Q&A](#diagram-qa)
- [Known Caveats](#known-caveats)

---

## Component Guide

What every service does and how it connects to the next.

| Service | Tier | Role | How it connects |
|---|---|---|---|
| **Route 53** | Edge | DNS + health-based routing | Resolves `taskio.com` → CloudFront, `api.taskio.com` → ALB. Health checks stop routing to unhealthy targets automatically |
| **CloudFront** | Edge | Global CDN for React app | Caches S3 static build at 400+ edge PoPs. Terminates HTTPS via ACM. First security gate via attached WAF |
| **WAF (on ALB)** | Edge | Web Application Firewall | Blocks OWASP Top 10 (SQLi, XSS), rate-limits by IP (e.g. 1000 req/5min). Stops attacks before reaching ECS |
| **S3** | Edge | Static asset hosting | Stores `vite build` output. Private bucket — accessible only via CloudFront OAC |
| **ACM** | Edge | SSL/TLS certificates | Provisions TLS certs for CloudFront and ALB. Auto-renews — no manual cert management |
| **Cognito** | Edge | Managed user auth | Handles registration, email verification, password reset, JWT issuance. Frontend calls Cognito SDK directly. ALB verifies JWT via JWKS endpoint automatically |
| **ALB** | Tier 2 | L7 load balancer + Cognito enforcer | Validates Cognito JWT on every request before forwarding to Fargate. Sticky sessions for WebSockets. Distributes across both AZs |
| **ECS Fargate** | Tier 2 | Serverless containers running Node.js | Runs the Express + Socket.io app in Docker. AWS manages underlying EC2. Auto Scaling on CPU > 70%. Tasks pull secrets from Secrets Manager at startup |
| **NAT Gateway (×2)** | Tier 2 | Outbound internet for private subnets | Fargate tasks in private subnets use NAT to reach Cloudinary, SES, and ECR. One per AZ for HA |
| **DynamoDB** | Tier 3 | Primary NoSQL database | Replaces MongoDB. Multi-table design, one table per collection. Accessed via VPC Gateway Endpoint — traffic never leaves AWS backbone |
| **ElastiCache Redis** | Tier 3 | Cache + Socket.io pub/sub broker | (1) TTL-based API response caching — reduces DynamoDB reads. (2) Socket.io Redis Adapter — broadcasts events across all Fargate tasks in real time |
| **ECR** | CI/CD | Docker image registry | Stores images tagged by Git commit SHA. Private — only ECS task role and CodeBuild can pull |
| **CodePipeline + CodeBuild** | CI/CD | Build and deploy automation | GitHub push → CodeBuild builds Docker image → pushes to ECR → ECS rolling deploy. Zero downtime |
| **CloudWatch** | Support | Observability | ECS task logs streamed here. Alarms on CPU > 80%, ALB 5xx rate, DynamoDB throttling |
| **Secrets Manager** | Support | Secure env var storage | Stores API keys, Redis password, etc. Injected into Fargate tasks at startup. Auto-rotation supported |

---

## Big Picture Request Flows

### Frontend load
```
User browser → Route 53 → CloudFront → S3 (React bundle) → Browser renders app
```

### Authenticated API call
```
React app → Cognito SDK (login) → JWT in cookie
         → ALB (validates JWT via Cognito JWKS)
         → ECS Fargate task
         → ElastiCache (cache hit?) → DynamoDB
         → Response
```

### WebSocket (real-time board updates)
```
React (socket.io-client) → ALB (sticky session)
                         → Fargate task A → Redis pub/sub
                                          → Fargate task B → Other clients
```

### Deploy
```
git push → GitHub → CodePipeline trigger → CodeBuild (Docker build)
        → ECR (image push) → ECS rolling deploy → Zero downtime ✅
```

---

## Tier 1 Defense

### Why S3 + CloudFront instead of hosting the frontend on EC2/ECS?

React compiles to static files — there is no reason to run a server for it. S3 + CloudFront is the AWS best practice for static SPAs: zero server management, sub-millisecond edge delivery, 99.99% availability SLA, and near-zero cost at our scale. Running EC2 for static files wastes compute budget and adds unnecessary failure points.

### Why Cognito instead of keeping your custom JWT system?

Custom auth means we own every security vulnerability: token rotation bugs, brute-force attack surface, PKCE implementation, MFA complexity. Cognito is SOC2/ISO-certified, handles all of that, and integrates natively with ALB — the ALB verifies Cognito JWTs automatically using JWKS, removing auth logic entirely from our app. It also gives us MFA, social login, and Cognito-triggered SES emails for free.

> **Caveat:** Migration requires refactoring auth routes and frontend auth flows. Cognito has limited UI customization.
> **Defense:** The frontend uses its own UI — only the token exchange changes. Migration scope is bounded and one-time.

### Why WAF on the ALB?

OWASP Top 10 managed rule set blocks SQLi, XSS, and HTTP floods before requests reach ECS. IP-based rate limiting prevents abuse. This is the AWS Well-Architected security best practice for public-facing APIs.

---

## Tier 2 Defense

### Why ECS Fargate and not AWS Lambda?

Our app uses Socket.io for real-time board invitations — this requires persistent, long-lived TCP connections. Lambda functions are stateless and terminate after execution. Lambda cannot maintain WebSocket connections without a separate API Gateway WebSocket API, requiring significant refactoring. Fargate runs our existing Express app in a container with **zero code changes** to the WebSocket layer.

> **Caveat:** Fargate has a higher baseline cost (~$30+/mo minimum per task) vs Lambda at low traffic.
> **Defense:** For a real-time collaborative app, always-on tasks are correct. Lambda cold starts (100ms–3s) would degrade the experience. The cost is justified by the latency requirements.

### The app is a monolith, not microservices — is ECS Fargate still correct?

**Yes. ECS Fargate runs containers, not microservices.** Microservices is an application architecture pattern — ECS is a container orchestrator that doesn't care whether your container holds one service or twenty.

What actually happens: the entire Express monolith is one Docker image. ECS runs N identical copies behind the ALB. That is horizontal scaling of a monolith — completely standard and production-proven.

The only things that break monolith horizontal scaling are:
- In-memory state not shared across instances → **solved by ElastiCache Redis**
- WebSocket rooms not shared across instances → **solved by Socket.io Redis Adapter**

Both are already in the architecture.

> **Follow-up: What about Elastic Beanstalk or App Runner?**
> App Runner has no WebSocket support — Socket.io breaks. Elastic Beanstalk uses managed EC2 with more ops overhead than Fargate. Fargate is the cleanest option.

### Why ALB and not API Gateway in front of ECS?

ALB natively supports WebSocket upgrades and sticky sessions. API Gateway HTTP API can forward to ALB but WebSockets require a separate API Gateway WebSocket API — adding complexity and cost. ALB also has a Cognito OIDC authenticator built in, so JWT validation happens before the request ever hits ECS. Lower latency (one fewer hop) and lower cost per request at scale.

### How does Socket.io work with multiple Fargate tasks?

Without coordination, two Fargate tasks each have their own in-memory Socket.io rooms. A client on Task A won't receive events emitted by Task B. We solve this with the `@socket.io/redis-adapter` package: all Socket.io events are published/subscribed through ElastiCache Redis, so any task can broadcast to any connected client.

> **Caveat:** Requires adding `@socket.io/redis-adapter` to the backend — small but required code change.

### Why Multi-AZ?

If an entire AWS Availability Zone goes down — a real event that has happened historically — a single-AZ deployment goes offline. With two AZs, the ALB reroutes within seconds. For a production SaaS serving paying customers this is the minimum viable HA configuration. The main cost is two NAT Gateways (~$64/mo combined), justified by the 99.99% uptime SLA.

### Why don't we use EC2 directly?

ECS Fargate IS running on EC2 under the hood — AWS manages the underlying instances invisibly. The difference is operational burden:

| | Raw EC2 | ECS on Fargate |
|---|---|---|
| OS patching | You | AWS |
| AMI management | You | AWS |
| SSH access | Required | Not needed |
| Scaling | Instance-level | Task-level |
| Billing | Per-hour per instance | Per-second per task |

---

## Tier 3 Defense

### Why DynamoDB instead of keeping MongoDB Atlas?

DynamoDB is fully AWS-native: no cluster to manage, automatic Multi-AZ replication, point-in-time recovery, and on-demand scaling with zero provisioning. MongoDB Atlas is a third-party service that requires separate billing and VPC peering setup. DynamoDB integrates natively with IAM, VPC Endpoints, and CloudWatch. For an AWS-hosted app, DynamoDB removes an external dependency.

> **Caveat — This is the hardest migration:** DynamoDB has no joins. Our app uses MongoDB `$lookup` aggregations heavily. DynamoDB requires redesigning access patterns using GSIs.
> **Defense:** We use a multi-table design (one table per collection) which mirrors our existing MongoDB structure. GSIs cover all main query patterns. AWS DMS handles the initial data migration.

### Should we use Amazon MemoryDB instead of ElastiCache for Redis?

**ElastiCache is the correct choice for our use case.**

- **ElastiCache** = in-memory cache. Data loss on failure is acceptable because DynamoDB is the source of truth. Used for TTL-based caching and Socket.io pub/sub.
- **MemoryDB** = durable Redis-compatible database with Multi-AZ transaction log. ~2x cost of ElastiCache.

MemoryDB is the right choice only when Redis itself is the durable source of truth. In our architecture, DynamoDB is the primary store and Redis is complementary. Using MemoryDB here means paying database-grade durability costs on a cache — a solution architect panel would question it.

### What does "VPC EP" mean on DynamoDB?

**VPC EP = VPC Gateway Endpoint.**

Without it: `ECS Fargate → NAT Gateway → public internet → DynamoDB` — you pay NAT data transfer fees ($0.045/GB) on every database call.

With it: `ECS Fargate → VPC Endpoint → DynamoDB (AWS private backbone)` — no internet, no NAT, no cost.

It is **free to create**, requires zero application code changes, and is faster (one fewer hop). A pure win on cost, performance, and security.

---

## CI/CD Defense

### Why CodePipeline over GitHub Actions?

CodePipeline is AWS-native: integrates directly with ECR, ECS, and IAM without managing AWS credentials as GitHub secrets. ECS rolling deployment is a first-class CodePipeline action. For an architecture targeting AWS, using AWS-native CI/CD is consistent and demonstrates full AWS stack proficiency.

> **Caveat:** CodePipeline is less flexible than GitHub Actions for complex workflows. Costs $1/pipeline/month.
> **Defense:** Our pipeline is straightforward — build → push → deploy. CodePipeline handles this cleanly.

### What is ECS and what is ECR? Why are both needed?

- **ECR (Elastic Container Registry)** = private Docker image warehouse. Stores your built image tagged by Git commit SHA (e.g. `taskio-api:abc123`).
- **ECS (Elastic Container Service)** = the orchestrator that pulls images from ECR and runs them as Fargate tasks. Handles health checks, auto-scaling, rolling deploys, and AZ placement.

They're separate because storage and execution are separate concerns. The deploy flow is:

```
CodeBuild builds image → pushes to ECR → ECS task definition references ECR URI → Fargate pulls and runs it
```

---

## Diagram Q&A

### What do the dashed lines mean vs solid lines?

- **Solid lines** = live request/response traffic — actual user data flowing through the system
- **Dashed lines** = configuration, credentials, or side-channel — not user traffic

Specific dashed lines:

| Line | Meaning |
|---|---|
| ACM → CloudFront / ALB | ACM provisions TLS cert once at setup. Not in the runtime request path |
| Cognito → ALB ("JWT validation") | ALB calls Cognito's JWKS endpoint in background to verify tokens |
| Fargate → CloudWatch | Container logs streamed as a side-channel. No user request touches CloudWatch |
| Fargate → Secrets Manager | Happens only at container startup — fetches env vars before serving traffic |
| ECR → Fargate ("pull image") | Happens only during deployment, not during user requests |
| ElastiCache replication | Internal Redis sync between primary (AZ1) and replica (AZ2) |

### Why are there 2 WAFs in the diagram?

They are on **two completely separate traffic paths**, not redundant:

```
taskio.com     → CloudFront + WAF #1 → S3      (frontend)
api.taskio.com → ALB       + WAF #2 → Fargate  (API)
```

WAF #1 on CloudFront protects the frontend from DDoS. WAF #2 on ALB protects your API endpoints with OWASP rules and rate limiting.

> **Simplification:** WAF only on the ALB is a valid cost trade-off for early-stage deployments — the real attack surface is the API. The CloudFront WAF can be removed to save ~$5-10/mo.

---

## Known Caveats

Own these before the panel raises them.

### 1. DynamoDB Migration Complexity
> MongoDB uses flexible `$lookup` aggregations. DynamoDB requires pre-planned GSIs for every query pattern. Under-designed GSIs = expensive full-table scans.

**Answer:** Access pattern analysis before schema design. Each collection's top query patterns map to a partition key + GSI combination. Multi-table design mirrors existing MongoDB structure. AWS DMS handles initial data migration.

### 2. Cognito Auth Refactor Effort
> The existing auth system is tightly coupled throughout the backend.

**Answer:** Bounded scope — `auth.middleware.js` switches to Cognito JWKS verification, auth routes removed, frontend switches to Cognito SDK. The 12 other API route groups are untouched.

### 3. Socket.io Redis Adapter Required
> Without `@socket.io/redis-adapter`, real-time events silently fail under multi-task load.

**Answer:** ~10 lines in `server.js`. ElastiCache is already in the architecture specifically to support this.

### 4. NAT Gateway Cost
> Two NAT Gateways = ~$64/mo fixed + data transfer fees.

**Answer:** VPC Endpoints for DynamoDB, S3, and ECR eliminate most NAT data transfer. Cost is predictable and justified for Multi-AZ HA.

### 5. No Built-in API Throttling (no API Gateway)
> ALB does not have per-route throttling natively.

**Answer:** WAF rate rules handle IP-level limiting. Redis-based middleware in Express handles per-user throttling.
