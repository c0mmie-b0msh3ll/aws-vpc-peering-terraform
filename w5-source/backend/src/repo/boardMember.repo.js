import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { boardMemberModel } from '~/models/boardMember.model'
import { boardRoleModel } from '~/models/boardRole.model'
import { userModel } from '~/models/user.model'
import { workspaceMemberModel } from '~/models/workspaceMember.model'

class BoardMemberRepo {
  static createOne = async ({ data, session }) => {
    const validData = await boardMemberModel.validateBeforeCreate(data)
    return await GET_DB()
      .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
      .insertOne(validData, { session })
  }

  static getMembers = async ({ filter, data, options = {} }) => {
    const { sort = { createdAt: -1 }, skip = 0, limit = 50 } = options
    const { search = '' } = data
    const db = GET_DB()

    // 1) Lấy boardMembers
    const boardMembers = await db
      .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()

    if (!boardMembers.length) return []

    // 2) Collect ids
    const boardRoleIds = boardMembers
      .map((m) => m.boardRoleId)
      .filter(Boolean)
      .map((id) => new ObjectId(id))

    const workspaceMemberIds = boardMembers
      .map((m) => m.workspaceMemberId)
      .filter(Boolean)
      .map((id) => new ObjectId(id))

    // 3) Lấy roles + workspaceMembers
    const [roles, workspaceMembers] = await Promise.all([
      db
        .collection(boardRoleModel.BOARD_ROLE_COLLECTION_NAME)
        .find({ _id: { $in: boardRoleIds } })
        .toArray(),

      db
        .collection(workspaceMemberModel.WORKSPACE_MEMBER_COLLECTION_NAME)
        .find({ _id: { $in: workspaceMemberIds } })
        .toArray()
    ])

    const roleMap = new Map(roles.map((r) => [String(r._id), r]))
    const workspaceMemberMap = new Map(
      workspaceMembers.map((m) => [String(m._id), m])
    )

    // 4) Lấy userIds từ workspaceMembers
    const userIds = workspaceMembers
      .map((m) => m.userId)
      .filter(Boolean)
      .map((id) => new ObjectId(id))

    let users = await db
      .collection(userModel.USER_COLLECTION_NAME)
      .find(
        search
          ? {
              _id: { $in: userIds },
              $or: [
                { email: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } }
              ]
            }
          : { _id: { $in: userIds } }
      )
      .toArray()

    const userMap = new Map(users.map((u) => [String(u._id), u]))

    // 5) build result
    const result = boardMembers
      .map((bm) => {
        const role = roleMap.get(String(bm.boardRoleId))
        const wm = workspaceMemberMap.get(String(bm.workspaceMemberId))
        const user = wm ? userMap.get(String(wm.userId)) : null

        if (!user) return null // filter search

        return {
          _id: bm._id,
          status: bm.status,
          joinAt: bm.joinAt,
          boardRoleId: bm.boardRoleId,
          role,
          userId: user._id,
          user: {
            displayName: user.displayName,
            email: user.email,
            avatar: user.avatar
          }
        }
      })
      .filter(Boolean)

    return result
  }

  static checkAccess = async ({ boardId, userId, session }) => {
    const db = GET_DB()

    const boardMember = await db
      .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
      .findOne(
        {
          boardId: String(boardId)
        },
        { session }
      )

    if (!boardMember) return null

    const workspaceMember = await db
      .collection(workspaceMemberModel.WORKSPACE_MEMBER_COLLECTION_NAME)
      .findOne(
        {
          _id: new ObjectId(boardMember.workspaceMemberId),
          userId: String(userId)
        },
        { session }
      )

    if (!workspaceMember) return null

    return boardMember
  }

  static findMemberInBoard = async ({ userId, boardId, session }) => {
    const db = GET_DB()

    const workspaceMember = await db
      .collection(workspaceMemberModel.WORKSPACE_MEMBER_COLLECTION_NAME)
      .findOne({ userId }, { session })

    if (!workspaceMember) return null

    const member = await db
      .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
      .findOne(
        {
          workspaceMemberId: String(workspaceMember._id),
          boardId,
          status: 'active'
        },
        { session }
      )

    return member || null
  }

  static updateOne = async ({ filter, data, session }) => {
    return await GET_DB()
      .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
      .findOneAndUpdate(filter, data, { session, returnDocument: 'after' })
  }

  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static countDocuments = async ({ filter }) => {
    return await GET_DB()
      .collection(boardMemberModel.BOARD_MEMBER_COLLECTION_NAME)
      .countDocuments(filter)
  }
}

export default BoardMemberRepo
