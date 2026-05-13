import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

const URI = process.env.MONGO_URI

if (!URI) {
  throw new Error('MONGO_URI is required to run the demo seed script')
}

const DAY = 86400 * 1000

function daysFromNow(n) { return new Date(Date.now() + n * DAY) }

async function main() {
  const client = new MongoClient(URI)
  await client.connect()
  const db = client.db('taskio')

  console.log('Connected to', db.databaseName)

  // 1. Seed user
  const userId = new ObjectId()
  const password = await bcrypt.hash('Demo@2026', 10)
  await db.collection('users').insertOne({
    _id: userId,
    email: 'demo@taskio.example.com',
    password,
    username: 'demo',
    displayName: 'Demo User',
    avatar: null,
    role: 'client',
    isActive: true,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: null
  })
  console.log('User created:', userId.toString(), '(email demo@taskio.example.com / password Demo@2026)')

  // 2. Seed workspace
  const workspaceId = new ObjectId()
  await db.collection('workspaces').insertOne({
    _id: workspaceId,
    title: 'Capstone Demo Workspace',
    description: 'Workspace demo dùng cho capstone AWS Cloud Essentials — showcase Bedrock KB + Lambda summarize',
    createdBy: userId.toString(),
    status: 'active',
    storageUsed: 0,
    createdAt: new Date(),
    updatedAt: null
  })
  console.log('Workspace created:', workspaceId.toString())

  // 3. Seed 2 boards
  const boardSprintId = new ObjectId()
  const boardBacklogId = new ObjectId()
  await db.collection('boards').insertMany([
    {
      _id: boardSprintId,
      workspaceId: workspaceId,
      title: 'Sprint 12 — AI Features',
      description: 'Sprint hiện tại, focus vào tích hợp AI Bedrock + Lambda cho capstone',
      visibility: 'workspace',
      type: 'normal',
      cover: null,
      status: 'active',
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: null
    },
    {
      _id: boardBacklogId,
      workspaceId: workspaceId,
      title: 'Product Backlog',
      description: 'Ý tưởng và tính năng roadmap tương lai',
      visibility: 'workspace',
      type: 'normal',
      cover: null,
      status: 'active',
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: null
    }
  ])
  console.log('2 boards created')

  // 4. Seed columns
  const colSprintTodoId = new ObjectId()
  const colSprintDoingId = new ObjectId()
  const colSprintReviewId = new ObjectId()
  const colSprintDoneId = new ObjectId()
  const colBacklogIdeasId = new ObjectId()
  const colBacklogApprovedId = new ObjectId()

  await db.collection('columns').insertMany([
    { _id: colSprintTodoId,    boardId: boardSprintId,  title: 'To Do',      cardOrderIds: [], color: 'default', status: 'active', createdAt: new Date(), updatedAt: null },
    { _id: colSprintDoingId,   boardId: boardSprintId,  title: 'In Progress',cardOrderIds: [], color: 'default', status: 'active', createdAt: new Date(), updatedAt: null },
    { _id: colSprintReviewId,  boardId: boardSprintId,  title: 'Review',     cardOrderIds: [], color: 'default', status: 'active', createdAt: new Date(), updatedAt: null },
    { _id: colSprintDoneId,    boardId: boardSprintId,  title: 'Done',       cardOrderIds: [], color: 'default', status: 'active', createdAt: new Date(), updatedAt: null },
    { _id: colBacklogIdeasId,  boardId: boardBacklogId, title: 'Ideas',      cardOrderIds: [], color: 'default', status: 'active', createdAt: new Date(), updatedAt: null },
    { _id: colBacklogApprovedId,boardId: boardBacklogId,title: 'Approved',  cardOrderIds: [], color: 'default', status: 'active', createdAt: new Date(), updatedAt: null }
  ])
  console.log('6 columns created')

  // 5. Seed cards — diverse data for AI summary to demonstrate
  const cards = [
    // Sprint Todo
    { title: 'Deploy Bedrock Knowledge Base trên production', desc: 'Setup KB với Titan V2 embeddings, S3 Vectors storage. Ingest 3 PDFs docs.', col: colSprintTodoId, board: boardSprintId, dueAt: daysFromNow(-3), completed: false, tasks: 5, done: 2 }, // OVERDUE
    { title: 'Viết IAM policy least-privilege cho 3 Lambda', desc: 'No wildcards, ARN-scoped. Test từng action.', col: colSprintTodoId, board: boardSprintId, dueAt: daysFromNow(2), completed: false, tasks: 3, done: 0 }, // DUE SOON
    { title: 'Tích hợp API Gateway với JWT authorizer', desc: 'HS256, cache TTL 5min, CORS allow origin frontend domain.', col: colSprintTodoId, board: boardSprintId, dueAt: daysFromNow(5), completed: false, tasks: 4, done: 1 },
    { title: 'Thiết kế UI DocsChatWidget', desc: 'MUI Drawer 400px, citations chip, markdown renderer.', col: colSprintTodoId, board: boardSprintId, dueAt: daysFromNow(7), completed: false, tasks: 2, done: 0 },

    // Sprint Doing
    { title: 'Implement summarizeWorkspace Lambda', desc: 'Mongo fetch + Bedrock Converse. Size guards: soft 200, hard 500 cards.', col: colSprintDoingId, board: boardSprintId, dueAt: daysFromNow(1), completed: false, tasks: 6, done: 4 }, // DUE SOON
    { title: 'Setup CloudWatch retention 7 days cho các Lambda', desc: '', col: colSprintDoingId, board: boardSprintId, dueAt: daysFromNow(-1), completed: false, tasks: 3, done: 2 }, // OVERDUE
    { title: 'Fix race condition khi drag-drop card multi-user', desc: 'Bug nghiêm trọng: khi 2 user kéo cùng card, backend race condition làm mất position.', col: colSprintDoingId, board: boardSprintId, dueAt: daysFromNow(0), completed: false, tasks: 2, done: 0 }, // OVERDUE

    // Sprint Review
    { title: 'Write architecture diagram mermaid cho capstone', desc: 'Include VPC, ALB, EC2, RDS, Lambda, Bedrock layers.', col: colSprintReviewId, board: boardSprintId, dueAt: daysFromNow(4), completed: false, tasks: 0, done: 0 },
    { title: 'Security review: S3 bucket policy cho user uploads', desc: 'Verify block public access, SSE-S3 enabled, presigned URL TTL 1h.', col: colSprintReviewId, board: boardSprintId, dueAt: daysFromNow(6), completed: false, tasks: 3, done: 3 },

    // Sprint Done
    { title: 'Smart Card Assist AI integration', desc: 'Bedrock Haiku 4.5, Redis cache 24h TTL.', col: colSprintDoneId, board: boardSprintId, dueAt: daysFromNow(-7), completed: true, tasks: 5, done: 5 },
    { title: 'AI Generate Board feature', desc: 'Template prompt, generate columns + cards từ user description.', col: colSprintDoneId, board: boardSprintId, dueAt: daysFromNow(-10), completed: true, tasks: 4, done: 4 },
    { title: 'Setup CI/CD GitHub Actions → OIDC → SSM SendCommand', desc: '', col: colSprintDoneId, board: boardSprintId, dueAt: daysFromNow(-14), completed: true, tasks: 6, done: 6 },
    { title: 'Migrate attachment storage sang S3 Standard-IA', desc: 'Cost optimization cho files ít truy cập.', col: colSprintDoneId, board: boardSprintId, dueAt: daysFromNow(-20), completed: true, tasks: 3, done: 3 },

    // Backlog Ideas
    { title: 'Dark mode toàn bộ app', desc: 'Theme toggle trong user settings, persist preference.', col: colBacklogIdeasId, board: boardBacklogId, dueAt: null, completed: false, tasks: 0, done: 0 },
    { title: 'Export workspace sang Trello/Jira', desc: 'Bridge để user migrate từ platform khác', col: colBacklogIdeasId, board: boardBacklogId, dueAt: null, completed: false, tasks: 0, done: 0 },
    { title: 'Native mobile app (React Native)', desc: 'iOS + Android, Q4/2026', col: colBacklogIdeasId, board: boardBacklogId, dueAt: null, completed: false, tasks: 0, done: 0 },

    // Backlog Approved
    { title: 'SSO login (Google, GitHub)', desc: 'Enterprise customers yêu cầu SSO, priority cao', col: colBacklogApprovedId, board: boardBacklogId, dueAt: daysFromNow(30), completed: false, tasks: 5, done: 0 },
    { title: '2FA TOTP support', desc: 'Google Authenticator compatible', col: colBacklogApprovedId, board: boardBacklogId, dueAt: daysFromNow(21), completed: false, tasks: 3, done: 0 }
  ]

  const cardDocs = cards.map(c => {
    const cardId = new ObjectId()
    return {
      _id: cardId,
      boardId: c.board,
      columnId: c.col,
      title: c.title,
      description: c.desc,
      memberIds: [userId.toString()],
      labelIds: [],
      cover: null,
      commentCount: 0,
      taskCount: c.tasks,
      completedTaskCount: c.done,
      isHasDescription: c.desc.length > 0,
      attachmentCount: 0,
      archivedAt: null,
      startedAt: null,
      dueAt: c.dueAt,
      isCompleted: c.completed,
      createdAt: daysFromNow(-30 + Math.random() * 25),
      updatedAt: daysFromNow(-5 + Math.random() * 5)
    }
  })
  await db.collection('cards').insertMany(cardDocs)
  console.log(`${cardDocs.length} cards created`)

  // Update column cardOrderIds
  const cardsByCol = new Map()
  for (const c of cardDocs) {
    if (!cardsByCol.has(String(c.columnId))) cardsByCol.set(String(c.columnId), [])
    cardsByCol.get(String(c.columnId)).push(c._id.toString())
  }
  for (const [colIdStr, cardIds] of cardsByCol.entries()) {
    await db.collection('columns').updateOne(
      { _id: new ObjectId(colIdStr) },
      { $set: { cardOrderIds: cardIds } }
    )
  }
  console.log('Column cardOrderIds updated')

  console.log('\n=== SEED COMPLETE ===')
  console.log('USER_ID:', userId.toString())
  console.log('WORKSPACE_ID:', workspaceId.toString())
  console.log('\nLogin creds:')
  console.log('  email: demo@taskio.example.com')
  console.log('  password: Demo@2026')

  await client.close()
}

main().catch(err => {
  console.error('SEED FAILED:', err)
  process.exit(1)
})
