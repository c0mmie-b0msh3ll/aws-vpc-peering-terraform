import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { userModel } from '~/models/user.model'

class UserRepo {
  static createOne = async ({ data }) => {
    const validData = await userModel.validateBeforeCreate(data)
    const createdUser = await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .insertOne(validData)
    return createdUser
  }

  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static findById = async ({ _id }) => {
    const result = await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(_id) })
    return result
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

  static findByEmailAndResetPassToken = async ({ email, resetPassToken }) => {
    const result = await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .findOne({ email, resetPassToken })
    return result
  }

  static countDocuments = async ({ filter }) => {
    const count = await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .countDocuments(filter)
    return count
  }

  static findManyWithPagination = async ({
    filter = {},
    skip = 0,
    limit = 8
  }) => {
    return await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray()
  }
}

export default UserRepo
