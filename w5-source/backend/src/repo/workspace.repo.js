import { workspaceModel } from '~/models/workspace.model'
import { GET_DB } from '~/config/mongodb'
import { workspaceMemberModel } from '~/models/workspaceMember.model'
import { ObjectId } from 'mongodb'

class WorkspaceRepo {
  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static createOne = async ({ data, session }) => {
    const validData = await workspaceModel.validateBeforeCreate(data)
    return await GET_DB()
      .collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
      .insertOne(validData, { session })
  }

  static updateOne = async ({ filter, data, session }) => {
    return await GET_DB()
      .collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
      .updateOne(filter, data, { session })
  }

  static deleteOne = async ({ filter, session }) => {
    return await GET_DB()
      .collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
      .deleteOne(filter, { session })
  }

  static fetchByUser = async ({ userId }) => {
    const db = GET_DB()

    const activeMemberships = await db
      .collection(workspaceMemberModel.WORKSPACE_MEMBER_COLLECTION_NAME)
      .find({
        userId,
        status: 'active'
      })
      .project({ workspaceId: 1 })
      .toArray()

    if (!activeMemberships.length) return []

    const workspaceObjectIds = activeMemberships
      .map((member) => member.workspaceId)
      .filter(Boolean)
      .map((id) => new ObjectId(id))

    return await db
      .collection(workspaceModel.WORKSPACE_COLLECTION_NAME)
      .find({
        _id: { $in: workspaceObjectIds }
      })
      .toArray()
  }
}

export default WorkspaceRepo
