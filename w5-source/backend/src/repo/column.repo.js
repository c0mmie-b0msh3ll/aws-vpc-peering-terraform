import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { cardModel } from '~/models/card.model'
import { columnModel } from '~/models/column.model'

class ColumnRepo {
  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(columnModel.COLUMN_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(columnModel.COLUMN_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static findById = async ({ _id, session }) => {
    const result = await GET_DB()
      .collection(columnModel.COLUMN_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(_id) }, { session })

    return result
  }

  static getDetail = async ({ _id }) => {
    try {
      const [column] = await GET_DB()
        .collection(columnModel.COLUMN_COLLECTION_NAME)
        .aggregate([
          { $match: { _id: new ObjectId(_id) } },

          {
            $lookup: {
              from: cardModel.CARD_COLLECTION_NAME,
              let: { columnIdStr: { $toString: '$_id' } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: [{ $toString: '$columnId' }, '$$columnIdStr'] },
                        { $eq: ['$status', 'active'] }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    status: 0,
                    description: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    archivedAt: 0
                  }
                }
              ],
              as: 'cards'
            }
          }
        ])
        .toArray()

      return column || null
    } catch (error) {
      throw error
    }
  }

  static createOne = async ({ data, session }) => {
    const validData = await columnModel.validateBeforeCreate(data)

    const createdColumn = await GET_DB()
      .collection(columnModel.COLUMN_COLLECTION_NAME)
      .insertOne(validData, { session })

    return createdColumn
  }

  static updateById = async ({ _id, data, session }) => {
    if (data.cardOrderIds)
      data.cardOrderIds = data.cardOrderIds.map((_id) => new ObjectId(_id))

    const result = await GET_DB()
      .collection(columnModel.COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: data },
        { returnDocument: 'after', session }
      )

    return result
  }

  static pushCardOrderIds = async ({ card, session }) => {
    const result = await GET_DB()
      .collection(columnModel.COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(card.columnId) },
        { $push: { cardOrderIds: new ObjectId(card._id) } },
        { returnDocument: 'after', session }
      )
    return result
  }

  static pullCardOrderIds = async ({ card, session }) => {
    const result = await GET_DB()
      .collection(columnModel.COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(card.columnId) },
        { $pull: { columnOrderIds: new ObjectId(card._id) } },
        { returnDocument: 'after', session }
      )
    return result
  }

  static deleteById = async ({ _id }) => {
    const result = await GET_DB()
      .collection(columnModel.COLUMN_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(_id) })
    return result
  }

  static count = async ({ filter = {}, options = {} }) => {
    return await GET_DB()
      .collection(columnModel.COLUMN_COLLECTION_NAME)
      .countDocuments(filter, options)
  }
}
export default ColumnRepo
