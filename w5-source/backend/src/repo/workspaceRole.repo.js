import { GET_DB } from '~/config/mongodb'
import { workspaceRoleModel } from '~/models/workspaceRole.model'

class WorkspaceRoleRepo {
  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(workspaceRoleModel.WORKSPACE_ROLE_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(workspaceRoleModel.WORKSPACE_ROLE_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static createOne = async ({ data, session }) => {
    const validData = await workspaceRoleModel.validateBeforeCreate(data)
    return await GET_DB()
      .collection(workspaceRoleModel.WORKSPACE_ROLE_COLLECTION_NAME)
      .insertOne(validData, { session })
  }

  static updateOne = async ({ filter, data, session }) => {
    return await GET_DB()
      .collection(workspaceRoleModel.WORKSPACE_ROLE_COLLECTION_NAME)
      .findOneAndUpdate(filter, data, { returnDocument: 'after', session })
  }

  static deleteOne = async ({ filter, session }) => {
    return await GET_DB()
      .collection(workspaceRoleModel.WORKSPACE_ROLE_COLLECTION_NAME)
      .deleteOne(filter, { session })
  }

  static deleteMany = async ({ filter, session }) => {
    return await GET_DB()
      .collection(workspaceRoleModel.WORKSPACE_ROLE_COLLECTION_NAME)
      .deleteMany(filter, { session })
  }

  static count = async ({ filter = {}, options = {} }) => {
    return await GET_DB()
      .collection(workspaceRoleModel.WORKSPACE_ROLE_COLLECTION_NAME)
      .countDocuments(filter, options)
  }
}
export default WorkspaceRoleRepo
