# AWS Well-Architected Framework — Taskio Compliance

How each design decision maps to the 6 pillars.

---

## Pillar 1 — Operational Excellence ⚙️
> *Run, monitor, and continuously improve operations*

| Service / Decision | Evidence |
|---|---|
| **CodePipeline + CodeBuild** | Fully automated CI/CD — every `git push` triggers build, test, and ECS rolling deploy with zero manual steps and zero downtime |
| **CloudWatch Logs & Alarms** | All ECS task stdout/stderr streamed to CloudWatch. Alarms on CPU > 80%, ALB 5xx rate, DynamoDB throttling — ops team alerted before users notice |
| **ECS Fargate** | No OS patching, no AMI management, no SSH sessions. AWS handles the runtime — team focuses on application logic, not infrastructure |
| **Secrets Manager** | Centralized config management. No hardcoded env vars. Secrets rotate automatically without redeploying |
| **ECS Rolling Deploy** | Health-check gated rollout (min 50% healthy). Failed deploys auto-rollback before old tasks are terminated |

**Score: 9/10**

---

## Pillar 2 — Security 🔐
> *Protect data, systems, and assets at every layer*

| Service / Decision | Evidence |
|---|---|
| **Amazon Cognito** | Managed auth — eliminates custom JWT signing, bcrypt misuse, and token rotation bugs. SOC2/ISO-certified identity provider |
| **WAF on ALB** | OWASP Top 10 managed rule set blocks SQLi, XSS, and HTTP floods before requests reach ECS. IP-based rate limiting prevents abuse |
| **VPC Private Subnets** | ECS tasks and ElastiCache are in private subnets — zero inbound internet access. ALB is the only public entry point |
| **ACM + HTTPS** | TLS 1.2+ enforced on CloudFront and ALB. ACM auto-renews certificates |
| **DynamoDB VPC Endpoint** | Database traffic never traverses the public internet — routed over AWS's private backbone |
| **IAM Least Privilege** | ECS task execution role grants only: ECR pull, Secrets Manager read, CloudWatch write. No wildcard permissions |

**Score: 9.5/10**

---

## Pillar 3 — Reliability 🛡️
> *Recover from failures and meet demand automatically*

| Service / Decision | Evidence |
|---|---|
| **Multi-AZ (AZ1 + AZ2)** | ECS tasks, ElastiCache, and ALB targets span 2 AZs. AZ failure → ALB reroutes within seconds automatically |
| **ALB Health Checks** | `GET /v1/status` checked every 30s. Unhealthy ECS tasks deregistered automatically |
| **DynamoDB** | Built-in Multi-AZ replication, 99.999% availability SLA, on-demand capacity means no throttling during spikes |
| **ElastiCache Primary + Replica** | Primary in AZ1, replica in AZ2. Automatic failover in ~30s if primary fails |
| **ECS Auto Scaling** | Target tracking on CPU utilization — new Fargate tasks spin up in ~60s. Min 2 tasks (one per AZ) at all times |
| **NAT Gateway × 2** | One per AZ. If AZ1 NAT fails, AZ2 Fargate tasks still have outbound internet access via AZ2 NAT |

**Score: 9/10**

---

## Pillar 4 — Performance Efficiency ⚡
> *Use resources efficiently as demand changes*

| Service / Decision | Evidence |
|---|---|
| **CloudFront** | React bundle served from 400+ edge PoPs worldwide — sub-10ms asset delivery globally |
| **ElastiCache Redis** | Sub-millisecond cache layer absorbs repetitive DynamoDB reads. Cache hit = no DB round-trip |
| **DynamoDB On-Demand** | No provisioned capacity limits — handles sudden traffic spikes without pre-warming or throttling |
| **ECS Fargate Task Sizing** | Right-size per task (512 vCPU / 1GB RAM baseline). Scale individual tasks without over-provisioning |
| **Socket.io Redis Adapter** | Real-time events broadcast via Redis pub/sub — O(1) delivery regardless of which Fargate task the client is on |
| **ALB Connection Reuse** | Persistent connections to ECS targets reduce TCP handshake overhead for high-frequency API calls |

**Score: 8.5/10**

---

## Pillar 5 — Cost Optimization 💰
> *Deliver value at the lowest price point*

| Service / Decision | Evidence |
|---|---|
| **ECS Fargate** | Pay per task-second — no idle EC2 costs. Scale to zero during off-hours |
| **DynamoDB On-Demand** | Pay per read/write request — no minimum hourly charge. Switch to provisioned at sustained high load for further savings |
| **S3 + CloudFront (Frontend)** | Hosting React SPA on S3+CloudFront costs cents per month. No server cost for presentation tier |
| **ElastiCache → reduces DynamoDB reads** | Each cache hit avoids a DynamoDB read. At scale, cache pays for itself |
| **DynamoDB VPC Endpoint** | Free to create. Eliminates NAT Gateway data processing fees for all DynamoDB traffic |
| **Single WAF on ALB** | WAF only on the API entry point — not duplicated on CloudFront for static assets. Saves ~$5-10/mo |

> **Known trade-off:** 2× NAT Gateway for HA is ~$64/mo fixed cost. Justified by Multi-AZ reliability requirement.

**Score: 8.5/10**

---

## Pillar 6 — Sustainability 🌱
> *Minimize environmental impact of cloud workloads*

| Service / Decision | Evidence |
|---|---|
| **ECS Fargate (Shared Fleet)** | AWS bins Fargate tasks onto shared, highly-utilized physical servers — higher hardware utilization than dedicated EC2 |
| **Auto Scaling (No Idle Waste)** | Tasks scale to match demand. No over-provisioned servers running at 5% CPU at 3am |
| **DynamoDB + ElastiCache (Managed)** | AWS manages hardware at massive scale — data center PUE and server utilization far better than self-hosted clusters |
| **CloudFront Edge Caching** | Cached responses at edge PoPs prevent repeat origin fetches — fewer compute cycles per user request |
| **S3 Static Hosting** | No dedicated server running for the frontend — effectively zero marginal energy cost per request |

> **Improvement opportunity:** Migrate ECS tasks to Graviton (ARM) processors — one-line change in the task definition, gives 20% better performance-per-watt.

**Score: 8/10**

---

## Summary

| Pillar | Score | Strongest Evidence |
|---|---|---|
| Operational Excellence | 9/10 | CodePipeline CI/CD + CloudWatch + Fargate no-ops |
| Security | 9.5/10 | Cognito + WAF + private subnets + IAM least privilege |
| Reliability | 9/10 | Multi-AZ all tiers + DynamoDB 99.999% SLA |
| Performance Efficiency | 8.5/10 | CloudFront edge + ElastiCache + Socket.io Redis adapter |
| Cost Optimization | 8.5/10 | Serverless compute + on-demand DB + VPC endpoint |
| Sustainability | 8/10 | Fargate shared fleet + auto-scale eliminates idle waste |
