# Design Choice Rationale

For every major service decision: what we chose, what we rejected, and exactly why.

---

## Tier 1 — Edge & Presentation

### Static Hosting: S3 + CloudFront vs alternatives

| Option | Verdict | Reason |
|---|---|---|
| **S3 + CloudFront** | ✅ Chosen | React builds to static files. No server needed. Global CDN delivery, 99.99% SLA, cents/month cost |
| EC2 / ECS for frontend | ❌ Rejected | Paying for a server to serve files that don't need a server. No added benefit |
| Amplify Hosting | ❌ Rejected | Adds Amplify vendor dependency. S3+CloudFront gives identical result with more control and less lock-in |
| Vercel / Netlify | ❌ Rejected | Third-party services outside AWS. Breaks the fully AWS-native architecture story |

---

### Authentication: Amazon Cognito vs alternatives

| Option | Verdict | Reason |
|---|---|---|
| **Amazon Cognito** | ✅ Chosen | Managed auth, SOC2-certified, native ALB integration, built-in MFA + social login, SES email triggers, no custom JWT vulnerabilities |
| Custom JWT (existing) | ❌ Replaced | We own every vulnerability: token rotation bugs, bcrypt misuse, brute-force exposure. Auth is not our core product |
| Auth0 / Firebase Auth | ❌ Rejected | Third-party dependencies outside AWS. Cognito is equivalent and keeps the stack AWS-native |
| AWS IAM Identity Center | ❌ Not applicable | Designed for internal AWS console access and workforce SSO, not for end-user app authentication |

**Key point:** The ALB natively validates Cognito JWTs via JWKS — zero auth code in the backend. No other auth provider has this first-class ALB integration.

---

### WAF: AWS WAF vs alternatives

| Option | Verdict | Reason |
|---|---|---|
| **AWS WAF on ALB** | ✅ Chosen | Managed OWASP Top 10 rule sets, IP rate limiting, native ALB attachment, pay-per-request pricing |
| AWS WAF on CloudFront | ⚠️ Optional | Useful for DDoS on frontend, but the real attack surface is the API. Can be added later |
| AWS Shield Advanced | ❌ Overkill | $3,000/mo minimum. Designed for critical infrastructure like banks and government. Not justified at our scale |
| Cloudflare WAF | ❌ Rejected | Third-party proxy in front of AWS infrastructure. Adds latency, cost, and breaks the AWS-native architecture |
| No WAF | ❌ Rejected | Direct exposure to OWASP Top 10 attacks. Not defensible to any security reviewer |

---

## Tier 2 — Application Layer

### Compute: ECS Fargate vs alternatives

| Option | Verdict | Reason |
|---|---|---|
| **ECS Fargate** | ✅ Chosen | Runs containers with zero EC2 management. Native WebSocket support via ALB sticky sessions. No code changes needed for the existing Express app |
| AWS Lambda | ❌ Rejected | **Socket.io requires persistent TCP connections — Lambda terminates after execution.** WebSockets on Lambda require a separate API Gateway WebSocket API and significant refactoring. Cold starts (100ms–3s) degrade real-time experience |
| EC2 Auto Scaling Group | ❌ Rejected | You manage OS patching, AMIs, SSH keys, security updates. Slower scaling (minutes vs seconds). Less cost-efficient — pay for the whole instance 24/7 even at low traffic |
| AWS App Runner | ❌ Rejected | **No WebSocket support.** Socket.io would break entirely |
| AWS Elastic Beanstalk | ❌ Rejected | Uses managed EC2 under the hood with more operational overhead than Fargate. No advantage for a containerized app |
| EKS (Kubernetes) | ❌ Overkill | Kubernetes adds significant operational complexity (control plane, node groups, RBAC, Helm). Not justified for a single-service monolith |

**Note on "monolith vs microservices":** ECS Fargate runs containers, not microservices. The monolith is packaged as one Docker image and scaled horizontally. Redis + Socket.io Redis Adapter solve the shared-state problem across tasks.

---

### Load Balancer: ALB vs API Gateway

| Option | Verdict | Reason |
|---|---|---|
| **ALB (Application Load Balancer)** | ✅ Chosen | Native WebSocket upgrade support, sticky sessions, built-in Cognito OIDC authenticator on listener rules, lower cost per request, lower latency (one fewer hop) |
| API Gateway HTTP API | ❌ Rejected | WebSockets require a separate API Gateway WebSocket API — splits the API into two entry points. Additional hop adds latency. More expensive per request at scale |
| API Gateway REST API | ❌ Rejected | Even more expensive than HTTP API. No WebSocket support. Per-request pricing becomes costly at volume |
| NLB (Network Load Balancer) | ❌ Rejected | Layer 4 only — no HTTP-level routing, no Cognito integration, no WAF attachment |

---

### CI/CD: CodePipeline + CodeBuild vs alternatives

| Option | Verdict | Reason |
|---|---|---|
| **CodePipeline + CodeBuild** | ✅ Chosen | AWS-native, integrates directly with ECR and ECS without managing external AWS credentials. ECS rolling deploy is a first-class action. IAM-based security |
| GitHub Actions | ❌ Rejected (for this architecture) | Requires storing AWS credentials as GitHub secrets. Less integrated with ECR/ECS. Better for polycloud setups, not for a fully AWS-native stack |
| Jenkins | ❌ Rejected | Requires managing a Jenkins server. Significant operational overhead for a CI/CD system. AWS-native tools eliminate this entirely |
| AWS CodeDeploy alone | ❌ Not sufficient | CodeDeploy handles deployment but doesn't build or push Docker images. CodePipeline orchestrates the full pipeline |

---

## Tier 3 — Data Layer

### Primary Database: DynamoDB vs alternatives

| Option | Verdict | Reason |
|---|---|---|
| **DynamoDB** | ✅ Chosen | AWS-native, fully managed, automatic Multi-AZ replication, on-demand scaling, pay-per-request, native VPC Endpoint, 99.999% SLA. No cluster to manage |
| MongoDB Atlas (existing) | ❌ Replaced | Third-party service outside AWS. Separate billing and SLA chain. Requires VPC peering setup. Adds external dependency to an otherwise fully AWS-native architecture |
| Amazon DocumentDB (MongoDB-compatible) | ⚠️ Alternative | MongoDB-compatible managed service. Would require less migration effort from MongoDB. However: cluster-based pricing (always-on cost), less AWS-native than DynamoDB, no serverless scaling |
| Amazon RDS (PostgreSQL/MySQL) | ❌ Rejected | Relational schema would require significant data model refactoring from document-based design. The app's data model (nested documents, flexible schemas) is a natural fit for NoSQL |
| Amazon Aurora Serverless | ❌ Rejected | Relational — same refactoring problem as RDS. DynamoDB's document model maps directly from MongoDB |

**Migration note:** MongoDB → DynamoDB is the most complex part of this migration. Multi-table design + GSIs for each access pattern. AWS DMS handles the initial data copy.

---

### Cache / Real-time Bus: ElastiCache (Redis) vs alternatives

| Option | Verdict | Reason |
|---|---|---|
| **ElastiCache for Redis** | ✅ Chosen | Managed Redis, Multi-AZ primary+replica, automated failover, native Socket.io Redis Adapter support, sub-millisecond latency |
| Amazon MemoryDB for Redis | ❌ Rejected | MemoryDB is a **durable primary database** with Multi-AZ transaction log. ~2x cost of ElastiCache. Correct choice only when Redis is the source of truth. In our architecture, DynamoDB is the primary store — paying for database-grade durability on a cache is unjustified |
| ElastiCache for Memcached | ❌ Rejected | No pub/sub support — Socket.io Redis Adapter requires Redis pub/sub. Memcached cannot replace Redis here |
| DynamoDB as cache | ❌ Rejected | DynamoDB read latency is single-digit milliseconds. ElastiCache is sub-millisecond. For session caching and real-time event routing, DynamoDB is too slow |
| Self-managed Redis (existing) | ❌ Replaced | Requires managing Redis instances manually — patching, failover, backups. ElastiCache eliminates this with managed HA |
| Redis Cloud (third-party) | ❌ Rejected | External service dependency. ElastiCache is AWS-native with tighter IAM and VPC integration |

---

## Networking

### Private Subnet Strategy: Private subnets vs alternatives

| Option | Verdict | Reason |
|---|---|---|
| **Private subnets for ECS + DB** | ✅ Chosen | ECS tasks and ElastiCache have no inbound internet access. ALB is the only public entry point. Defence-in-depth per AWS Well-Architected Security Pillar |
| Public subnets for everything | ❌ Rejected | Direct internet exposure of backend tasks and database. No defence if WAF or ALB is misconfigured. Fails basic security review |
| VPN-only access | ❌ Overkill | Adds VPN infrastructure for a public-facing web app. ALB + private subnets achieves the same security posture without VPN complexity |

### DynamoDB Access: VPC Endpoint vs NAT Gateway

| Option | Verdict | Reason |
|---|---|---|
| **VPC Gateway Endpoint** | ✅ Chosen | Free to create. DynamoDB traffic stays on AWS private backbone. No NAT data transfer fees. Faster |
| NAT Gateway for DynamoDB | ❌ Inefficient | Pays $0.045/GB data transfer fee on every DB call. Traffic exits and re-enters AWS network unnecessarily |
| DynamoDB in public subnet | ❌ Not possible | DynamoDB is a managed service — it doesn't live in your VPC at all. Access is always via endpoint or internet |
