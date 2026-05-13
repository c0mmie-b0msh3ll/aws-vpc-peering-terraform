# Sequence Diagrams

Key interaction flows across the Taskio system.

---

## 1. User Authentication Flow (Cognito)

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend (S3/CloudFront)
    participant Cognito as Amazon Cognito
    participant ALB as ALB + WAF
    participant API as ECS Fargate (Node.js API)
    participant Cache as ElastiCache (Redis)

    User->>FE: Enter email + password
    FE->>Cognito: InitiateAuth (USER_PASSWORD_AUTH)
    Cognito-->>FE: AccessToken + IdToken + RefreshToken
    Note over FE,Cognito: Tokens stored in httpOnly cookies

    FE->>ALB: GET /v1/users/me (Cookie: AccessToken)
    ALB->>ALB: Validate Cognito JWT (JWKS endpoint)
    ALB->>API: Forward request + decoded claims
    API->>Cache: Check user session cache
    Cache-->>API: Cache miss
    API->>API: Fetch user from DynamoDB
    API-->>Cache: Cache user profile (TTL 5min)
    API-->>ALB: 200 { user }
    ALB-->>FE: 200 { user }
    FE-->>User: Redirect to Dashboard
```

---

## 2. Create Card Flow (REST API)

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant ALB as ALB
    participant API as ECS Fargate (API)
    participant DB as DynamoDB
    participant Cache as ElastiCache
    participant Log as ActivityLog

    User->>FE: Click "Add Card" on Column
    FE->>ALB: POST /v1/cards { boardId, columnId, title }
    ALB->>ALB: Validate Cognito JWT
    ALB->>API: Forward + userContext

    API->>API: Validate request (Joi schema)
    API->>DB: Check board permission for user
    DB-->>API: Permission OK

    API->>DB: Insert Card document
    DB-->>API: { _id, cardId, ... }

    API->>DB: Push cardId to Column.cardOrderIds
    DB-->>API: Column updated

    API->>Log: Insert ActivityLog (created card)
    API->>Cache: Invalidate board cache
    Cache-->>API: OK

    API-->>ALB: 201 { card }
    ALB-->>FE: 201 { card }
    FE-->>User: Card appears on board (optimistic UI)
```

---

## 3. Real-time Board Invitation (Socket.io)

```mermaid
sequenceDiagram
    actor Inviter
    actor Invitee
    participant FE_A as Inviter Frontend
    participant FE_B as Invitee Frontend
    participant ALB as ALB (sticky session)
    participant API as ECS Fargate (Socket.io)
    participant DB as DynamoDB
    participant Cache as ElastiCache (Redis Pub/Sub)

    Note over FE_A,FE_B: Both clients connected via WebSocket to ALB (sticky session)

    Inviter->>FE_A: Send board invitation
    FE_A->>ALB: POST /v1/invitations { inviteeId, boardId }
    ALB->>API: REST call
    API->>DB: Create Invitation record
    DB-->>API: Invitation created

    API->>Cache: PUBLISH invite:userId event
    Cache-->>API: Published to all Fargate instances

    Note over API: Socket.io Redis Adapter delivers to correct task
    API->>FE_B: socket.emit('inviteUserToBoard', payload)
    FE_B-->>Invitee: 🔔 Notification popup appears

    Invitee->>FE_B: Accept invitation
    FE_B->>ALB: PUT /v1/invitations/:id { status: accepted }
    ALB->>API: Update invitation
    API->>DB: Update Invitation + Create BoardMember
    DB-->>API: Done
    API->>FE_B: socket.emit('boardInvitationAccepted')
    API->>FE_A: socket.emit('boardInvitationAccepted')
    FE_A-->>Inviter: Invitee joined board
```

---

## 4. File Upload Flow (S3 Presigned URL)

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant API as ECS Fargate (API)
    participant S3P as S3Provider (AWS SDK)
    participant S3 as Amazon S3
    participant DB as DynamoDB

    User->>FE: Attach file to Card
    FE->>API: POST /v1/attachments { cardId, fileName, fileType }
    API->>S3P: getSignedUrl(PutObject, key, expires=300s)
    S3P-->>API: presignedUrl

    API-->>FE: { presignedUrl, attachmentId }
    FE->>S3: PUT presignedUrl (file bytes, direct upload)
    S3-->>FE: 200 OK

    FE->>API: PUT /v1/attachments/:id { status: uploaded }
    API->>DB: Update Attachment { fileUrl, fileSize, status }
    DB-->>API: OK
    API-->>FE: 200 { attachment }
    FE-->>User: Attachment visible on Card
```
