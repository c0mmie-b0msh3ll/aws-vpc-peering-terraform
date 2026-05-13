import { boardRoleModel } from '~/models/boardRole.model'
import { GET_DB } from '~/config/mongodb'

class BoardRoleRepo {
  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(boardRoleModel.BOARD_ROLE_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static createOne = async ({ data, session }) => {
    const validData = await boardRoleModel.validateBeforeCreate(data)
    return await GET_DB()
      .collection(boardRoleModel.BOARD_ROLE_COLLECTION_NAME)
      .insertOne(validData, { session })
  }

  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(boardRoleModel.BOARD_ROLE_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static updateOne = async ({ filter, data, session }) => {
    return await GET_DB()
      .collection(boardRoleModel.BOARD_ROLE_COLLECTION_NAME)
      .findOneAndUpdate(filter, data, { returnDocument: 'after', session })
  }

  static deleteOne = async ({ filter, session }) => {
    return await GET_DB()
      .collection(boardRoleModel.BOARD_ROLE_COLLECTION_NAME)
      .deleteOne(filter, { session })
  }

  static count = async ({ filter = {}, options = {} }) => {
    return await GET_DB()
      .collection(boardRoleModel.BOARD_ROLE_COLLECTION_NAME)
      .countDocuments(filter, options)
  }
}

export default BoardRoleRepo
