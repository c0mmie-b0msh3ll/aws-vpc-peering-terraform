import path from 'path'
import { fileURLToPath } from 'url'
import { MongoClient, ObjectId } from 'mongodb'
import { getSecretJson } from './secrets.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CA_FILE = path.join(__dirname, '..', 'global-bundle.pem')

let cachedClient = null

async function getMongo() {
  if (cachedClient) {
    try {
      await cachedClient.db('admin').command({ ping: 1 })
      return cachedClient
    } catch (err) {
      // Stale connection (topology closed after Lambda idle) — reset and recreate
      console.warn('Mongo cached client stale, recreating:', err.message)
      try { await cachedClient.close() } catch {}
      cachedClient = null
    }
  }
  const { uri } = await getSecretJson(process.env.MONGO_SECRET_ARN)
  cachedClient = new MongoClient(uri, {
    tlsCAFile: CA_FILE,
    tlsAllowInvalidHostnames: true,
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 1
  })
  await cachedClient.connect()
  return cachedClient
}

function toId(s) {
  try { return new ObjectId(s) } catch { return null }
}

export async function fetchWorkspaceBundle(workspaceIdStr, userIdStr) {
  const client = await getMongo()
  const db = client.db()

  const wsObjId = toId(workspaceIdStr)
  if (!wsObjId || !workspaceIdStr || !userIdStr) return null

  // workspaces._id is ObjectId; all foreign keys (workspaceId, boardId, userId) are String in this DB
  const workspace = await db.collection('workspaces').findOne({ _id: wsObjId })
  if (!workspace) return null

  const isOwner = String(workspace.createdBy) === String(userIdStr)
  let isMember = isOwner
  if (!isOwner) {
    const membership = await db.collection('workspaceMembers').findOne({
      workspaceId: workspaceIdStr,
      userId: userIdStr,
      status: 'active'
    })
    isMember = !!membership
  }
  if (!isMember) return { forbidden: true }

  const boards = await db.collection('boards')
    .find({ workspaceId: workspaceIdStr, archivedAt: null })
    .toArray()

  const boardIdStrs = boards.map(b => String(b._id))
  const columns = await db.collection('columns')
    .find({ boardId: { $in: boardIdStrs }, status: 'active' })
    .toArray()

  const cards = await db.collection('cards')
    .find({ boardId: { $in: boardIdStrs }, archivedAt: null })
    .toArray()

  // Count total members
  const memberCount = await db.collection('workspaceMembers').countDocuments({
    workspaceId: workspaceIdStr,
    status: 'active'
  }) + 1 // +1 for owner

  return {
    workspace: {
      _id: String(workspace._id),
      title: workspace.title,
      description: workspace.description,
      memberCount
    },
    boards: boards.map(b => ({
      _id: String(b._id),
      title: b.title,
      description: b.description
    })),
    columns: columns.map(c => ({
      _id: String(c._id),
      title: c.title,
      boardId: String(c.boardId)
    })),
    cards: cards.map(c => ({
      _id: String(c._id),
      title: c.title,
      description: c.description || '',
      columnId: String(c.columnId),
      boardId: String(c.boardId),
      memberIds: (c.memberIds || []).map(String),
      dueAt: c.dueAt ? new Date(c.dueAt).toISOString() : null,
      isCompleted: !!c.isCompleted,
      commentCount: c.commentCount || 0,
      completedTaskCount: c.completedTaskCount || 0,
      taskCount: c.taskCount || 0,
      updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date(c.createdAt).toISOString()
    }))
  }
}
