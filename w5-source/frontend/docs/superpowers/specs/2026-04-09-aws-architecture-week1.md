# AWS Architecture Design — Taskio (Week 1 Submission)

**Date:** 2026-04-09
**App:** Taskio — Trello-like task management SPA
**Stack:** React + Vite (frontend) · Node.js + Express + Socket.io (backend) · MongoDB → DynamoDB
**Target region:** `ap-southeast-1` (Singapore)
**Scope:** Week 1 AWS fundamentals — map application to core AWS services, explain *why* each choice
**Design constraints:** (1) match the rubric exactly, (2) minimize cost (Free Tier where possible), (3) minimize operational complexity

> This is the **Week 1 submission version**. A more advanced production design (ECS Fargate, multi-AZ, Blue/Green, full observability) lives in `2026-04-08-aws-architecture-design.md` as a reference for future iterations.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Application → AWS Mapping](#2-application--aws-mapping)
3. [Compute — EC2](#3-compute--ec2) *(Rubric B.1, 5đ)*
4. [Database — DynamoDB](#4-database--dynamodb) *(Rubric B.2, 5đ)*
5. [Storage — S3](#5-storage--s3) *(Rubric B.3, 5đ)*
6. [Network & Entry Point — VPC, Subnets, SG](#6-network--entry-point) *(Rubric B.4, 5đ)*
7. [Security — IAM & Shared Responsibility](#7-security--iam--shared-responsibility) *(Rubric B.5, 5đ)*
8. [Region & AZ](#8-region--az) *(Rubric B.6, 3đ)*
9. [Cost Analysis & Free Tier](#9-cost-analysis--free-tier) *(Rubric B.7, 2đ)*
10. [What We Deliberately Left Out](#10-what-we-deliberately-left-out)
11. [Required Code Changes Before Deploy](#11-required-code-changes-before-deploy)
12. [Q&A Cheat Sheet](#12-qa-cheat-sheet)

---

## 1. Architecture Overview

```
                        ┌──────────────────────────┐
                        │   Users (Vietnam)        │
                        └───────────┬──────────────┘
                                    │ HTTPS
                    ┌───────────────┼──────────────────┐
                    │                                  │
         app.taskio.com                        api.taskio.com
                    │                                  │
                    │ (A record)                       │ (A record → Elastic IP)
                    │                                  │
          ┌─────────▼─────────┐             ┌──────────▼──────────┐
          │   AWS Amplify     │             │   Route 53          │
          │   Hosting         │             │   (hosted zone)     │
          │ - GitHub webhook  │             └──────────┬──────────┘
          │ - auto build/deploy│                        │
          │ - built-in CDN    │             ┌──────────▼──────────┐
          │ - HTTPS auto      │             │  VPC 10.0.0.0/16    │
          └───────────────────┘             │  ap-southeast-1     │
                                            │                     │
                                            │  Public subnet      │
                                            │  10.0.1.0/24 (AZ-a) │
                                            │  ┌─────────────────┐│
                                            │  │  EC2 t3.micro   ││
                                            │  │  Node + Express ││
                                            │  │  + Socket.io    ││
                                            │  │  + Nginx (TLS)  ││
                                            │  │  Elastic IP     ││
                                            │  │  IAM Role       ││
                                            │  └────┬────┬───────┘│
                                            │       │    │        │
                                            │  Private subnet     │
                                            │  10.0.11.0/24 (AZ-a)│
                                            │  (reserved for      │
                                            │   future cache/DB)  │
                                            └───────┼────┼────────┘
                                                    │    │
                                        ┌───────────┘    └────────────┐
                                        │                             │
                                   ┌────▼─────┐                ┌──────▼──────┐
                                   │ DynamoDB │                │      S3     │
                                   │ (boards, │                │ taskio-     │
                                   │  cards,  │                │ uploads     │
                                   │  users)  │                │ (attachments│
                                   │          │                │  + avatars) │
                                   └──────────┘                └─────────────┘

                                   ┌──────────────────┐
                                   │   CloudWatch     │
                                   │   Logs + Alarms  │
                                   └──────────────────┘
```

**The entire architecture uses 7 AWS services:** Route 53, Amplify Hosting, EC2 (inside VPC + public subnet + Security Group), DynamoDB, S3, IAM, CloudWatch. One service per rubric category, no more.

---

## 2. Application → AWS Mapping

How each piece of Taskio's actual code lands on AWS:

| Taskio code | Build artifact | Lands on |
|---|---|---|
| `taskio-web/` React + Vite SPA | `dist/` (static HTML/JS/CSS) | **AWS Amplify Hosting** (auto-built from GitHub) |
| `taskio-api/` Node.js monolith | Node source + `node_modules` | **EC2** instance (running via `systemd` or `pm2`) |
| Express routes (`/v1/boards`, `/v1/users/*`, ...) | Same process | EC2 port 3001 → Nginx reverse proxy :443 |
| `socket.io` server | Same process | EC2 (single instance = no pub/sub adapter needed) |
| `JwtProvider.js` — our own JWT auth | In-process | EC2 (stateless JWT — no external auth service) |
| Mongoose models (`boardModel.js`, etc.) | **REWRITE to AWS SDK** | **DynamoDB** tables |
| `S3Provider.js` — file uploads | AWS SDK S3 client | **S3** bucket `taskio-uploads` |
| Env vars (JWT secret, etc.) | `process.env.*` | **SSM Parameter Store** (free, fetched at app start via IAM role) |
| App logs (`console.log`, pino) | stdout | **CloudWatch Logs** via CloudWatch agent |

**Key fact:** Taskio runs as a single Node.js process on a single EC2 instance. No containers, no Kubernetes, no orchestration. This is appropriate for Week 1 scale and directly answers all the rubric's EC2-focused Q&A questions.

---

## 3. Compute — EC2

*Rubric B.1 — 5đ*

### Choice: Single EC2 instance, `t3.micro`

| Attribute | Value | Why |
|---|---|---|
| Instance type | `t3.micro` | 2 vCPU burstable, 1 GB RAM — free tier eligible |
| AMI | Amazon Linux 2023 | AWS-maintained, free, long support |
| Placement | Public subnet, AZ `ap-southeast-1a` | Needs outbound internet for `npm install` + OS updates |
| IP | Elastic IP (static) | Route 53 A-record pins to it — survives instance reboots |
| Runtime | Node.js 20 installed via `dnf` | Matches local dev version |
| Process manager | `systemd` unit (`taskio-api.service`) | Auto-restart on crash, starts on boot |
| Reverse proxy | Nginx on :443 → Node on :3001 | TLS termination via Let's Encrypt (certbot) |

### Why EC2, not Lambda

The rubric allows Lambda as an alternative. We chose EC2 because:

1. **Socket.io needs persistent connections.** Lambda has a 15-minute execution ceiling and cannot hold open WebSocket connections across invocations. Socket.io's core value proposition — realtime collaboration on boards — is incompatible with Lambda's stateless, short-lived model.
2. **Lambda cold starts hurt interactive UX.** Even a fast Node Lambda has 200–500ms cold start. Users clicking around Trello-style boards feel every cold start.
3. **The app is a monolith.** Lambda works best for small, independent functions. Splitting Taskio into 30+ Lambda functions would be a massive refactor with no benefit at current scale.

### How we'd answer the rubric's sample Q&A

| Question | Answer |
|---|---|
| *"What is an EC2 instance?"* | A virtual machine AWS rents us — we pick CPU/RAM/storage, AWS handles the hypervisor and physical hardware. |
| *"How did you pick instance size?"* | Started with `t3.micro` (free tier). Monitor CloudWatch CPU — if consistently > 70%, scale up to `t3.small`. Current traffic is small enough that `t3.micro`'s burstable credits cover peaks. |
| *"What if the EC2 is killed suddenly?"* | Elastic IP survives; data in DynamoDB/S3 is durable. We re-launch from a saved AMI or a small bootstrap script. **Recovery time: ~5 minutes. Week 1 scope accepts this downtime — a future upgrade adds Auto Scaling Group across multi-AZ for zero-downtime failover.** |
| *"Why not Auto Scaling Group?"* | ASG + ALB adds ~$16/month and operational complexity (multi-instance state, sticky sessions for Socket.io, ALB health checks). Not justified at current scale. Listed as future improvement. |

### Bootstrap (user data script)

```bash
#!/bin/bash
dnf update -y
dnf install -y nodejs git nginx certbot python3-certbot-nginx
# Clone app
cd /opt && git clone https://github.com/<org>/taskio-api.git
cd taskio-api && npm ci --production
# systemd unit
cat > /etc/systemd/system/taskio-api.service <<EOF
[Unit]
Description=Taskio API
After=network.target
[Service]
ExecStart=/usr/bin/node /opt/taskio-api/src/server.js
Restart=always
User=ec2-user
Environment=NODE_ENV=production
[Install]
WantedBy=multi-user.target
EOF
systemctl enable --now taskio-api
# Nginx reverse proxy + TLS
# (certbot --nginx -d api.taskio.com run manually once, or via Ansible)
```

---

## 4. Database — DynamoDB

*Rubric B.2 — 5đ*

### Choice: DynamoDB (NoSQL, managed, serverless)

### Why NoSQL fits Taskio

Taskio's data is naturally hierarchical and document-shaped:

```
Board
  ├── columns[]
  │     ├── cards[]
  │     │    ├── attachments[]
  │     │    └── comments[]
```

- **No joins needed.** A board is a self-contained unit. When a user opens a board, we fetch that board's document — never join across boards.
- **Reads vastly outnumber writes.** Users view boards far more often than they edit them. NoSQL's single-table read performance wins.
- **Schema evolves freely.** Adding a new field to a card (e.g., `dueDate`, `labels`) doesn't require an `ALTER TABLE` — DynamoDB is schema-less per item.
- **Key-based access pattern.** Everything is fetched by `boardId` or `userId` — DynamoDB's partition key model is a perfect fit.

### Why DynamoDB specifically (not DocumentDB)

| | DynamoDB | DocumentDB (MongoDB-compatible) |
|---|---|---|
| Free Tier | **25 GB + 25 RCU/WCU forever** | ❌ not Free Tier — smallest instance ~$55/month |
| Code migration | Rewrite `repo/` folder (~20 files) | Zero code changes (MongoDB API compatible) |
| Operational cost | **$0/month** at Free Tier scale | ~$55/month minimum |
| Ops burden | Fully managed, no maintenance | Fully managed, but we pay for compute |
| AWS-native | ✅ deeply integrated with IAM, CloudWatch | Less native — runs on managed instances |

**We chose DynamoDB and accept the one-time code migration cost** to get a permanently free database. This is a deliberate trade-off, documented in Section 11 with a list of exactly which files need rewriting. The rewrite is mechanical (`find()` → `QueryCommand`, `insertOne()` → `PutItemCommand`), not a semantic change.

### Table design

```
Table: Users
  PK: userId (String)
  Attributes: email, passwordHash, displayName, createdAt

Table: Boards
  PK: boardId (String)
  Attributes: ownerId, title, columns (List of Maps), members (List), createdAt
  GSI: ownerId-index → query "all boards owned by user X"

Table: BoardMembers
  PK: userId, SK: boardId
  GSI: boardId-userId-index → query "all members of board X"
```

- **On-Demand billing mode** — pay per request, no capacity planning. Free Tier covers 25 RCU + 25 WCU forever.
- **Point-in-Time Recovery** enabled — 35 days of continuous backups, rollback to any second. Small cost but worth it.

### Rubric Q&A: SQL vs NoSQL

> *"Why NoSQL and not SQL for Taskio?"*
>
> Taskio's data is document-shaped and hierarchical — a board is a self-contained tree of columns and cards. SQL's strength is normalized, relational data with joins across tables. We have no joins. We never ask "find all cards across all boards where X" — every query starts with `boardId`. NoSQL's key-based access is a natural fit, and DynamoDB's schema flexibility means we can evolve card attributes without migrations.
>
> If Taskio needed complex reporting across boards (e.g., "top 10 most active users across all boards last month"), SQL would be better. But that's analytics, not the hot path.

---

## 5. Storage — S3

*Rubric B.3 — 5đ*

### Bucket: `taskio-uploads`

**Purpose:** user-uploaded card attachments (files, images) and avatars. This is the **only** thing stored in S3 for the backend — the React SPA is served by Amplify Hosting separately.

### What we store

| Data type | Path prefix | Why S3 |
|---|---|---|
| Card attachments | `attachments/{boardId}/{cardId}/{filename}` | Durable, cheap, effectively unlimited. Users upload directly via pre-signed URLs — files never touch EC2 |
| User avatars | `avatars/{userId}.{ext}` | Small, public-read, cached by browser |

### Why S3, not EC2 local disk

- **Durability:** S3 guarantees 99.999999999% (11 nines). EC2 EBS volumes can fail; S3 replicates across multiple AZs automatically.
- **EC2 is ephemeral.** If the EC2 instance is re-launched (OS upgrade, hardware failure), anything on local disk is lost. S3 survives.
- **No backup hassle.** We don't need to design a backup strategy for user files — AWS handles it.
- **Cost.** S3 Standard is ~$0.023/GB/month. EBS gp3 is ~$0.08/GB/month. S3 is 3.5× cheaper for data at rest.

### Upload flow (the pre-signed URL pattern)

```
1. Client: POST /v1/uploads/presign { fileName, contentType }
2. EC2 (Node): uses IAM role to call s3.getSignedUrl() → returns a time-limited URL
3. Client: PUT <presigned URL> with file body (direct browser → S3, bypasses EC2)
4. Client: POST /v1/cards/{id}/attachments { s3Key }
5. EC2 (Node): writes the s3Key reference into DynamoDB
```

This is why EC2 never needs to proxy upload traffic — huge bandwidth savings.

### Bucket security

- **Block Public Access** ON for everything under `attachments/` — files only accessible via pre-signed URLs (time-limited, IAM-verified).
- `avatars/` can be `public-read` for simplicity (public profile pics are not sensitive).
- **Bucket policy** denies any request not from our IAM role unless via pre-signed URL.
- **Versioning** enabled — protects against accidental deletes.

---

## 6. Network & Entry Point

*Rubric B.4 — 5đ*

### VPC topology

```
VPC: taskio-vpc  (10.0.0.0/16)  — region ap-southeast-1

├── Public subnet:   10.0.1.0/24   (AZ-a)
│     └── EC2 instance (Elastic IP, Nginx, Node app)
│
├── Private subnet:  10.0.11.0/24  (AZ-a)
│     └── (empty — reserved for future cache/database layer)
│
├── Internet Gateway (igw-taskio)
│     └── Attached to VPC — enables inbound/outbound for public subnet
│
└── Route tables
      ├── public-rt:  0.0.0.0/0 → IGW
      └── private-rt: local only (no NAT — cost optimization)
```

### Public vs Private — what the distinction means

| | Public subnet | Private subnet |
|---|---|---|
| Route to Internet Gateway | ✅ yes (`0.0.0.0/0 → igw`) | ❌ no |
| Instances can have public IPs | ✅ yes | ❌ no |
| Reachable from the internet | yes (if SG allows) | never directly |
| Can reach the internet outbound | ✅ yes via IGW | only via NAT Gateway (not in our design to save cost) |

**Where each resource lives in our design:**
- **Public subnet:** the EC2 instance — it needs inbound HTTPS from users and outbound internet for `npm update` / OS patches.
- **Private subnet:** intentionally empty for now, documented as the target for future ElastiCache (Redis cache) or RDS deployment. This demonstrates we understand the *pattern* even though we don't need it at Week 1 scale.

### Security Groups — layered, least privilege

```
sg-alb-public      (not used — we skipped ALB)

sg-ec2-taskio      (attached to EC2 instance)
  Inbound:
    - 443/tcp from 0.0.0.0/0  (HTTPS — Nginx terminates TLS)
    - 80/tcp  from 0.0.0.0/0  (HTTP → redirects to 443)
    - 22/tcp  from <your-home-ip>/32  (SSH for admin, IP-restricted)
  Outbound:
    - all traffic (for OS updates, npm, DynamoDB, S3, CloudWatch)
```

**SG references IPs, not other SGs, in this simple topology.** In the multi-tier version (future), the database SG would allow inbound *from* `sg-ec2-taskio` by reference — that's the AWS idiom for "only this tier can talk to that tier."

### Why no ELB / ALB

The rubric says **"ELB (nếu có)"** — ELB is optional. We skipped it because:

1. **Cost.** ALB is ~$16/month minimum (not Free Tier). Single biggest non-free item in the architecture.
2. **Complexity.** ALB introduces target groups, health checks, listener rules, and sticky-session configuration for Socket.io. More services to explain at Q&A.
3. **Not needed at Week 1 scale.** ALB adds value when you have multiple backend instances behind it. We have one. A single EC2 with Elastic IP is simpler and cheaper.
4. **Fault tolerance trade-off acknowledged.** Without ALB + ASG, EC2 failure means ~5 minutes of downtime while we re-launch. We accept this for Week 1 scope.

**Future upgrade path:** add ALB + Auto Scaling Group across 2 AZs → zero-downtime failover, horizontal scaling. That's documented in the production spec.

### Traffic flow

```
1. User types "app.taskio.com" in browser
2. Route 53 resolves to Amplify Hosting CDN → React SPA loads
3. React app calls "api.taskio.com/v1/boards" (via axios)
4. Route 53 resolves api.taskio.com → Elastic IP of EC2
5. Request hits EC2 on port 443 (Nginx)
6. Nginx terminates TLS, proxies to Node on localhost:3001
7. Node (Express) handles the route, fetches from DynamoDB via IAM role
8. Response flows back the same way
```

---

## 7. Security — IAM & Shared Responsibility

*Rubric B.5 — 5đ*

### IAM Roles — the "no access keys" principle

**The #1 rule of AWS security:** never put access keys in code or on an EC2 instance. Instead, attach an **IAM Role** to the EC2 instance and let the AWS SDK fetch temporary credentials automatically.

### Role: `EC2TaskioRole`

```
Trust policy: allow EC2 service to assume this role
Attached policies:

1. Custom inline: DynamoDB access (scoped to Taskio tables only)
   {
     "Effect": "Allow",
     "Action": [
       "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
       "dynamodb:DeleteItem", "dynamodb:Query", "dynamodb:BatchGetItem"
     ],
     "Resource": [
       "arn:aws:dynamodb:ap-southeast-1:ACCOUNT:table/Boards",
       "arn:aws:dynamodb:ap-southeast-1:ACCOUNT:table/Users",
       "arn:aws:dynamodb:ap-southeast-1:ACCOUNT:table/BoardMembers",
       "arn:aws:dynamodb:ap-southeast-1:ACCOUNT:table/*/index/*"
     ]
   }

2. Custom inline: S3 access (scoped to taskio-uploads only)
   - s3:PutObject, GetObject, DeleteObject on taskio-uploads/*
   - s3:ListBucket on taskio-uploads (for presigned URL generation)

3. Custom inline: SSM Parameter Store (for JWT_SECRET, etc.)
   - ssm:GetParameter, GetParameters on /taskio/prod/*

4. Managed: CloudWatchAgentServerPolicy (for log shipping)
```

**Principle of least privilege:** the role can only touch Taskio-specific tables/buckets/parameters. It cannot list all DynamoDB tables, cannot read other S3 buckets, cannot see other apps' secrets.

### ⚠️ Code issue to fix before deploy

**Current code has hardcoded S3 credentials** in `taskio-api/src/providers/S3Provider.js`:

```js
// Current (WRONG for production):
static client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_USER_ACCESS_KEY,
    secretAccessKey: env.AWS_USER_SECRET_ACCESS_KEY
  }
})
```

**Fix for production deploy:**

```js
// Deploy version (uses IAM Role automatically):
static client = new S3Client({ region: env.AWS_REGION })
// The AWS SDK automatically picks up credentials from the EC2 instance metadata service
// when an IAM Role is attached. No explicit credentials needed.
```

Delete the `AWS_USER_ACCESS_KEY` and `AWS_USER_SECRET_ACCESS_KEY` env vars entirely. Rotate those keys immediately after removing them from the codebase — they have been committed to git history and should be considered compromised.

### Shared Responsibility Model

The AWS Shared Responsibility Model splits security duties between AWS and the customer:

| AWS's responsibility (*"security OF the cloud"*) | Our responsibility (*"security IN the cloud"*) |
|---|---|
| Physical data centers (guards, power, cooling) | OS patches on the EC2 instance (`dnf update`) |
| Hypervisor, host OS security | Node.js version upgrades & CVE response |
| Network infrastructure (undersea cables, routers) | Application code (SQL injection, XSS, CSRF — none of these apply to DynamoDB/Node but we still write safe code) |
| DynamoDB & S3 service durability & availability | IAM policies — who can access what |
| Encryption primitives (AES, TLS libraries) | Turning encryption ON; managing key rotation |
| Hardware failure detection | Monitoring our app's health (CloudWatch alarms) |

**Key insight for EC2 specifically:** because we chose EC2 (not Fargate or Lambda), **we own the operating system.** If there's a kernel CVE tomorrow, we patch it. This is the trade-off for EC2's flexibility — AWS gives us more control, but more responsibility.

### Application-level auth (not IAM)

Taskio already has its own JWT-based user authentication in `taskio-api/src/providers/JwtProvider.js`. This handles **user login**, not AWS service-to-service auth. The two are separate layers:

- **JWT (custom)**: authenticates end users ("is this the real Alice?")
- **IAM (AWS)**: authenticates the EC2 instance to AWS services ("can this EC2 read the Boards table?")

We chose **not to use AWS Cognito** because:
1. Taskio already has working JWT auth
2. Migrating to Cognito would require rewriting the auth middleware, login/register endpoints, and password reset flows
3. Scope of Week 1 is "deploy the app to AWS," not "rewrite the auth system"

---

## 8. Region & AZ

*Rubric B.6 — 3đ*

### Region: `ap-southeast-1` (Singapore)

**Why Singapore:**

1. **Latency.** Singapore is the closest AWS region to Vietnam. Round-trip latency from Ho Chi Minh City to `ap-southeast-1`: ~30–50ms. Compared to `us-east-1` (Virginia): ~200+ ms. For interactive apps like Taskio, latency is user-perceptible.
2. **Pricing.** Singapore is standard APAC pricing — not the cheapest (us-east-1 is) but within 10–15%. The latency benefit far outweighs the price difference for our users.
3. **Compliance.** No specific data residency requirement for Taskio yet. If Vietnam introduces data localization laws later, `ap-southeast-1` is still the closest major region outside Vietnam itself.
4. **Service availability.** `ap-southeast-1` has full service coverage — DynamoDB, EC2, S3, Amplify, all available. Some newer regions lack services; Singapore is a mature, well-equipped region.

### Availability Zones (AZs)

**What is an AZ?** An Availability Zone is a **physically separate data center** within a region. Each AZ has its own power, cooling, networking, and physical security. AZs within a region are connected by low-latency private fiber (< 2ms between AZs).

**Key property:** AZs are designed to fail independently. A fire in AZ `1a` does not affect AZ `1b`. A power outage in one AZ leaves the others running.

`ap-southeast-1` has **three AZs**: `ap-southeast-1a`, `ap-southeast-1b`, `ap-southeast-1c`.

### Our AZ usage: single-AZ (by choice)

We deployed to **one AZ (`ap-southeast-1a`)** for Week 1. The VPC spans the region, but only one public subnet in `1a` actually contains resources.

**Trade-off honestly acknowledged:**
- ✅ Simpler topology (easier to explain at Q&A)
- ✅ Lower cost (no NAT Gateway per AZ, no duplicate resources)
- ❌ If AZ `1a` fails, Taskio is down until we re-launch in another AZ (~10 minutes manual recovery)

**Future upgrade (documented in production spec):** deploy EC2 via Auto Scaling Group across `1a` and `1b`, add ALB spanning both AZs. Result: an entire AZ can fail and Taskio stays up with zero manual intervention.

### Rubric Q&A cheat

> *"What is an Availability Zone?"*
>
> An AZ is a physically isolated data center within an AWS region. Each AZ has independent power, cooling, and network. AZs within a region are connected by fast private fiber. We deploy to multiple AZs to survive the failure of a single data center. In `ap-southeast-1` there are three AZs: `1a`, `1b`, `1c`.

> *"Why not multi-AZ?"*
>
> Multi-AZ requires an Auto Scaling Group + ALB ($16/month), or multi-AZ DB instances (DynamoDB is already multi-AZ by default, so that part is free). For Week 1 scope, we chose single-AZ EC2 to stay within Free Tier. DynamoDB and S3 are both multi-AZ by default — they provide durability guarantees even though our compute is single-AZ.

---

## 9. Cost Analysis & Free Tier

*Rubric B.7 — 2đ*

### Service-by-service breakdown

| Service | Free Tier | Taskio usage | Monthly cost during Free Tier | Monthly cost after |
|---|---|---|---|---|
| EC2 `t3.micro` | 750 hours/month × 12 months | 1 × 730 hours | **$0** | ~$7.59 |
| Elastic IP | Free while attached to running instance | attached | **$0** | $0 |
| EBS gp3 (8 GB root) | 30 GB/month × 12 months | 8 GB | **$0** | ~$0.80 |
| DynamoDB | **25 GB + 25 RCU + 25 WCU forever** | well under | **$0** | **$0 forever** |
| S3 Standard | 5 GB + 20k GET + 2k PUT × 12 months | small uploads | **$0** | ~$1 |
| Amplify Hosting | 1000 build-min + 15 GB served + 5 GB stored × 12 months | small SPA | **$0** | ~$1–3 |
| Route 53 hosted zone | — | 1 zone | ~$0.50 | $0.50 |
| Route 53 queries | Not Free Tier | low traffic | ~$0.40 | ~$0.40 |
| CloudWatch Logs | 5 GB ingestion + 5 GB storage | minimal | **$0** | ~$0.50 |
| CloudWatch basic metrics | Always free | — | $0 | $0 |
| SSM Parameter Store (standard) | Always free | few params | $0 | $0 |
| Data transfer out | 100 GB/month × 12 months | low | **$0** | ~$0 |
| **Total** | | | **~$1/month** | **~$11/month** |

### Cost risks to watch

- **EBS snapshots** if we enable auto-backup of EC2 — not free tier, ~$0.05/GB/month. Currently disabled.
- **Data transfer out** — first 100 GB/month is free, then $0.09/GB. For Taskio's traffic pattern this is negligible.
- **Route 53 queries** — $0.40 per million queries. Even 10M queries/month is $4. Negligible at our scale.
- **Amplify build minutes** — 1000 min free, then $0.01/minute. Typical React build is ~2 minutes, so 500 builds free per month. Unless we spam-push, we won't hit this.

### Most expensive service

During Free Tier period: **nothing** — everything is free except the Route 53 hosted zone (~$0.50/month).

After Free Tier expires (month 13): **EC2 `t3.micro`** at ~$7.59/month becomes the biggest line item. If cost pressure matters, options: switch to `t4g.micro` (ARM, ~$6.13/month), use Reserved Instances (1-year commitment, ~40% off), or move to a smaller VPS outside AWS.

### Free Tier viability

**Yes — Taskio runs on AWS for approximately $0–1 per month during the first 12 months,** and roughly $11/month after Free Tier expires. This is a viable long-term hosting solution for a personal project or small team.

---

## 10. What We Deliberately Left Out

Defensive Q&A preparation: if a grader asks *"why didn't you use X?"*, here are the rehearsed answers. Each omitted service has a specific reason tied to either **cost** or **Week 1 scope**.

| Omitted service | Why we left it out | When we'd add it |
|---|---|---|
| **ALB (Application Load Balancer)** | $16/month, not Free Tier. Not needed with a single EC2. | When we scale to 2+ EC2 instances for fault tolerance |
| **Auto Scaling Group (ASG)** | Only valuable with ALB + multiple instances | Same as ALB — together |
| **NAT Gateway** | $32/month/AZ, not Free Tier. EC2 is in public subnet, no NAT needed | When EC2 moves to private subnet (with ALB in front) |
| **CloudFront (for the API)** | Our frontend CDN is handled by Amplify. CloudFront for the API adds latency for dynamic content and costs extra | If we serve large cached responses globally |
| **AWS WAF** | Not Free Tier ($5/WebACL + $1/rule/month). Overkill for Week 1 | Once we have paying customers / threat model justifies it |
| **Cognito** | Taskio already has working JWT auth. Migration = rewrite | If we need social login, MFA, or SSO |
| **ElastiCache (Redis)** | Not needed for single-instance Socket.io. Not Free Tier at practical sizes | When we add multi-instance backend (pub/sub adapter required) |
| **DocumentDB** | Not Free Tier (~$55/month). DynamoDB is $0 forever | If we refuse to rewrite the `repo/` folder — but we're willing to |
| **Secrets Manager** | $0.40/secret/month. Use SSM Parameter Store instead (free) | When we need automatic secret rotation |
| **ECS / Fargate / ECR** | Containers add an orchestration layer we don't need at this scale. Rubric explicitly focuses on EC2 | When we have 5+ services deployed independently |
| **CodePipeline / CodeBuild / CodeDeploy** | Amplify handles frontend CI/CD. Backend deploys manually via `ssh + git pull` or a simple GitHub Action | When backend deploys become frequent enough to need automation |
| **X-Ray, CloudTrail** | Advanced observability/audit. CloudWatch Logs is sufficient for Week 1 debugging | Production maturity, compliance requirements |
| **Multi-account (Organizations)** | One AWS account is fine for Week 1 | Team grows, separate dev/staging/prod accounts |

**The one-sentence version:** *"Anything not in the 7 rubric categories was left out because it adds cost or complexity without answering a Week 1 requirement. Every exclusion is an explicit decision, not an oversight."*

---

## 11. Required Code Changes Before Deploy

Be honest about this at Q&A — trying to hide code changes makes you look less prepared than owning them.

### Change 1: Data access layer (MongoDB → DynamoDB)

**Scope:** `taskio-api/src/repo/*.js` — approximately 20 files (boardRepo, cardRepo, userRepo, etc.)

**Nature of change:** mechanical, not semantic. Examples:

| MongoDB | DynamoDB |
|---|---|
| `boardCollection.findOne({ _id })` | `client.send(new GetItemCommand({ TableName: 'Boards', Key: { boardId } }))` |
| `boardCollection.find({ ownerId })` | `client.send(new QueryCommand({ TableName: 'Boards', IndexName: 'ownerId-index', KeyConditionExpression: 'ownerId = :o', ExpressionAttributeValues: { ':o': ownerId } }))` |
| `boardCollection.insertOne(doc)` | `client.send(new PutItemCommand({ TableName: 'Boards', Item: doc }))` |
| `boardCollection.updateOne({ _id }, { $set: {...} })` | `client.send(new UpdateItemCommand({ ... }))` |
| `boardCollection.deleteOne({ _id })` | `client.send(new DeleteItemCommand({ ... }))` |

**Effort estimate:** 1–2 days of focused work for an experienced Node developer. Every repo file follows the same pattern — once you write one, the rest are copy/adapt.

**Controllers, services, routes:** **unchanged.** Only the data access layer moves.

### Change 2: Remove hardcoded S3 credentials (`S3Provider.js`)

Replace explicit credentials with `new S3Client({ region })` — the SDK picks up the EC2 instance role automatically. Delete `AWS_USER_ACCESS_KEY` and `AWS_USER_SECRET_ACCESS_KEY` from `.env` and from git history. Rotate those keys.

### Change 3: Remove MongoDB config

Delete `taskio-api/src/config/mongodb.js` and any `MONGODB_URI` references. Replace with a DynamoDB client config.

### Change 4: Add SIGTERM handler (graceful shutdown)

```js
// server.js
const server = app.listen(port, ...)

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
  // Force-exit after 10s if still hanging
  setTimeout(() => process.exit(1), 10_000)
})
```

This ensures when `systemctl restart taskio-api` runs, in-flight requests complete cleanly instead of being cut off.

### Change 5: Health check endpoint

```js
// routes/health.route.js
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})
```

Used by CloudWatch synthetic monitoring (future), by operators checking if the service is up, and by any future ALB health checks.

### Change 6: Centralized config from SSM Parameter Store

Replace direct `process.env.JWT_SECRET` reads with a startup-time fetch from SSM:

```js
// config/loadSecrets.js
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm'
const ssm = new SSMClient({ region: 'ap-southeast-1' })

export async function loadSecrets() {
  const { Parameters } = await ssm.send(new GetParametersCommand({
    Names: ['/taskio/prod/JWT_SECRET', '/taskio/prod/JWT_REFRESH_SECRET'],
    WithDecryption: true
  }))
  return Object.fromEntries(Parameters.map(p => [p.Name.split('/').pop(), p.Value]))
}
```

Call `loadSecrets()` once at server startup, cache the result. Keeps secrets out of env files entirely.

---

## 12. Q&A Cheat Sheet

Likely questions from the grader (based on rubric language), with 2–3 sentence answers. Each team member should memorize the answers for their assigned service.

### Compute (EC2)

| Q | A |
|---|---|
| *What is an EC2 instance?* | A virtual machine running on AWS. We rent CPU, RAM, and storage; AWS manages the underlying hypervisor and physical hardware. We chose `t3.micro` — 2 vCPU burstable, 1 GB RAM — because it's Free Tier eligible and enough for Week 1 traffic. |
| *How do you pick instance size?* | Start small (`t3.micro`), monitor CloudWatch CPU and memory. Scale up (to `t3.small`, etc.) if metrics consistently exceed 70% utilization. Don't over-provision upfront — Free Tier gives us room to experiment. |
| *What happens if the EC2 is suddenly killed?* | Elastic IP and all data (DynamoDB, S3) survive. We re-launch the instance from an AMI or a bootstrap script, reattach the Elastic IP, and the app is back up in ~5–10 minutes. Downtime is acceptable at Week 1 scope; for production we'd add an ASG for automatic replacement. |
| *Why not Lambda?* | Socket.io needs persistent WebSocket connections. Lambda has a 15-minute execution ceiling and is stateless between invocations — incompatible with long-lived WebSockets. |

### Database (DynamoDB)

| Q | A |
|---|---|
| *Why NoSQL for Taskio?* | Taskio's data is hierarchical and document-shaped — boards contain columns contain cards. No joins needed, every query starts from a `boardId`. DynamoDB's key-based partition model is a natural fit. |
| *Why DynamoDB over RDS?* | Two reasons: (1) DynamoDB has **Always Free** tier (25 GB + 25 RCU/WCU forever) while RDS Free Tier expires after 12 months; (2) Taskio's data model is already document-shaped from the MongoDB implementation — NoSQL fits, SQL would require denormalizing into rigid tables. |
| *But the code uses MongoDB — why not DocumentDB?* | DocumentDB would let us keep the code unchanged, but it costs ~$55/month minimum and isn't Free Tier. We chose DynamoDB and accepted a one-time rewrite of the `repo/` folder to get $0/month database cost forever. The rewrite is mechanical (~20 files, maps MongoDB verbs to DynamoDB commands) and the business logic is unchanged. |
| *Doesn't DynamoDB lock us in?* | Some — the repo layer would need another rewrite to move off. But the rest of the code (services, controllers, routes) is cloud-neutral. The lock-in is limited to 20 files, which is an acceptable trade for permanent free hosting. |

### Storage (S3)

| Q | A |
|---|---|
| *What do you store in S3?* | User-uploaded card attachments and avatars. The React SPA itself is served from Amplify Hosting separately. |
| *Why S3 instead of EC2 disk?* | Durability (11 nines) and survival across instance restarts. EC2 local storage is ephemeral — an instance replacement loses everything. S3 replicates across AZs automatically. |
| *How do users upload files?* | The browser requests a pre-signed URL from the backend (authenticated with JWT + IAM), then uploads directly to S3. Files never pass through EC2, which saves bandwidth and CPU. |
| *Is the bucket public?* | No. `Block Public Access` is enabled for attachments. Users access files via time-limited pre-signed URLs. Avatars can be public-read since profile pictures aren't sensitive. |

### Network

| Q | A |
|---|---|
| *Public vs private subnet?* | Public subnets have a route to the Internet Gateway, so resources there can have public IPs and be reachable from the internet. Private subnets have no IGW route — resources there cannot be directly reached from the internet. EC2 is in public subnet (needs inbound HTTPS + outbound for updates); private subnet is reserved for future cache/database. |
| *Why no ALB?* | Cost and simplicity. ALB is ~$16/month (not Free Tier), adds target groups and health checks to manage, and isn't needed for a single EC2 instance. The rubric explicitly lists ELB as optional ("nếu có"). For Week 1 scope, single EC2 + Elastic IP is sufficient. |
| *How does a request reach the app?* | DNS query to Route 53 → resolves to EC2's Elastic IP → TCP connection on port 443 → Nginx terminates TLS → reverse-proxies to Node on localhost:3001 → Node handles the route → response flows back. |
| *Why multiple subnets if you only use one?* | The VPC design accommodates future growth. Having public and private subnets defined now means we can drop resources into them later without a VPC redesign. The private subnet is reserved for cache/database when scale requires it. |

### Security

| Q | A |
|---|---|
| *How does EC2 authenticate to S3/DynamoDB?* | Via an **IAM Role** attached to the EC2 instance. The AWS SDK automatically fetches temporary credentials from the instance metadata service — we never put access keys in code or env files. |
| *What is Shared Responsibility?* | AWS handles "security of the cloud" (physical data centers, hypervisor, hardware). We handle "security in the cloud" (OS patches, application code, IAM policies, who can do what). For EC2 specifically, we own the OS — AWS doesn't patch it for us. |
| *Why not Cognito?* | Taskio already has custom JWT authentication in `JwtProvider.js`. Adding Cognito would require rewriting login, register, password reset, and the auth middleware. Not worth the scope expansion. Cognito is for apps that need social login, MFA, or enterprise SSO — none of which we need yet. |
| *The code has hardcoded AWS keys in `S3Provider.js` — is that secure?* | **No** — that's the current dev setup, which we're explicitly fixing before deploy. We'll remove the env vars, switch to the default SDK credential chain (which uses the EC2 IAM Role), and rotate the old keys. This was caught during code review and is documented in the deploy prep checklist. |

### Region / AZ / Cost

| Q | A |
|---|---|
| *Why Singapore (`ap-southeast-1`)?* | Closest AWS region to Vietnam — 30–50 ms latency vs 200+ ms for US regions. Pricing is standard APAC. Full service coverage for everything we need. |
| *What is an Availability Zone?* | A physically isolated data center within a region — separate power, cooling, network. AZs within a region are connected by fast private fiber (< 2 ms). Each region has 2–6 AZs; `ap-southeast-1` has three. |
| *Does Taskio run on Free Tier?* | Yes, for the first 12 months. The only non-zero cost is the Route 53 hosted zone (~$0.50/month). After Free Tier expires, EC2 becomes ~$7.59/month and S3 / Amplify add a few dollars. Total: ~$1/month Year 1, ~$11/month Year 2+. |
| *What's the most expensive service?* | During Free Tier: Route 53 (~$0.50/month). After Free Tier: EC2 `t3.micro` (~$7.59/month). If cost matters more, switch to ARM-based `t4g.micro` (~$6.13/month) or buy a Reserved Instance for ~40% off. |

---

## Appendix: Deploy Checklist (Not Graded, But Useful)

Pre-deploy:
- [ ] Rewrite `repo/` folder to use AWS SDK (DynamoDB)
- [ ] Remove hardcoded S3 credentials from `S3Provider.js`
- [ ] Rotate old AWS access keys
- [ ] Add SIGTERM handler to `server.js`
- [ ] Add `/v1/health` endpoint
- [ ] Create SSM Parameter Store entries for JWT_SECRET, etc.
- [ ] Write `cloud-init` / user-data script for EC2 bootstrap
- [ ] Build AMI with pre-installed Node + Nginx (optional, speeds re-launches)

AWS setup:
- [ ] Create VPC with public + private subnets in `ap-southeast-1a`
- [ ] Create IAM role `EC2TaskioRole` with scoped policies
- [ ] Create DynamoDB tables: `Users`, `Boards`, `BoardMembers`
- [ ] Create S3 bucket `taskio-uploads` with Block Public Access
- [ ] Launch EC2 `t3.micro` in public subnet, attach IAM role
- [ ] Allocate Elastic IP, attach to EC2
- [ ] Register `taskio.com` in Route 53, create A records
- [ ] Connect Amplify Hosting to `taskio-web` GitHub repo
- [ ] Run `certbot` for HTTPS on `api.taskio.com`
- [ ] Verify end-to-end: SPA loads, API calls work, file upload works, realtime events work
