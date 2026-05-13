import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { cardModel } from '~/models/card.model'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'

class CardRepo {
  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static findOneById = async ({ _id }) => {
    const result = await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(_id) })
    return result
  }

  static createOne = async ({ data, session }) => {
    const validData = await cardModel.validateBeforeCreate(data)
    return await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .insertOne(validData, { session })
  }

  static updateOne = async ({ filter, data, session }) => {
    const updateData = {
      ...data,
      $set: {
        ...(data.$set || {}),
        updatedAt: new Date()
      }
    }

    return await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .findOneAndUpdate(filter, updateData, {
        session,
        returnDocument: 'after'
      })
  }

  static updateMany = async ({ filter, data, session }) => {
    const updateData = {
      ...data,
      $set: {
        ...(data.$set || {}),
        updatedAt: new Date()
      }
    }

    return await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .updateMany(filter, updateData, { session })
  }

  static deleteByColumnId = async ({ columnId }) => {
    const result = await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .deleteMany({ columnId: new ObjectId(columnId) })
    return result
  }

  static unshiftNewComment = async ({ _id, data }) => {
    const result = await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $push: { comments: { $each: [data], $position: 0 } } },
        { returnDocument: 'after' }
      )
    return result
  }

  static updateMembers = async ({ _id, data, session }) => {
    let updateCondition = {}
    if (data.action === CARD_MEMBER_ACTIONS.ADD) {
      updateCondition = {
        $push: { memberIds: new ObjectId(data.boardMemberId) }
      }
    }

    if (data.action === CARD_MEMBER_ACTIONS.REMOVE) {
      updateCondition = {
        $pull: { memberIds: new ObjectId(data.boardMemberId) }
      }
    }

    const result = await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(_id) }, updateCondition, {
        returnDocument: 'after',
        session
      })
    return result
  }

  static deleteOne = async ({ filter, session }) => {
    return await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .deleteOne(filter, { session })
  }

  static deleteMany = async ({ filter, session }) => {
    return await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .deleteMany(filter, { session })
  }

  static count = async ({ filter = {}, options = {} }) => {
    return await GET_DB()
      .collection(cardModel.CARD_COLLECTION_NAME)
      .countDocuments(filter, options)
  }
}
export default CardRepo
