import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { userModel } from '~/models/user.model'

class UserRepo {
  static findById = async ({ _id }) => {
    const result = await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(_id) })
    return result
  }

  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static findByEmail = async ({ email }) => {
    const result = await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .findOne({ email })
    return result
  }

  static updateById = async ({ _id, data }) => {
    const result = await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: data },
        { returnDocument: 'after' }
      )

    return result
  }

  static updateOne = async ({ filter, update, options = {} }) => {
    const result = await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .findOneAndUpdate(filter, update, {
        returnDocument: 'after',
        ...options
      })

    return result
  }
}

export default UserRepo
