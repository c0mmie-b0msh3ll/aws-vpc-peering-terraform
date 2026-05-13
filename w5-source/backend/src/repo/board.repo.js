import { GET_DB } from '~/config/mongodb'
import { pagingSkipValue } from '~/utils/algorithms'
import { boardModel } from '~/models/board.model'
import { ObjectId } from 'mongodb'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
import { columnModel } from '~/models/column.model'
import { cardModel } from '~/models/card.model'

class BoardRepo {
  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static findById = async ({ _id }) => {
    const result = await GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(_id) })
    return result
  }

  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static count = async ({ filter = {} }) => {
    return await GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .countDocuments(filter)
  }

  static getBoards = async ({ filters }) => {
    const page = filters?.page ?? DEFAULT_PAGE
    const itemsPerPage = filters?.itemsPerPage ?? DEFAULT_ITEMS_PER_PAGE
    const q = filters?.q ?? ''
    const userId = filters?.userId

    const queryConditions = [
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }
    ]

    if (q) {
      Object.keys(q).forEach((key) => {
        queryConditions.push({
          [key]: { $regex: new RegExp(q[key], 'i') }
        })
      })
    }

    const collection = GET_DB().collection(boardModel.BOARD_COLLECTION_NAME)
    const matchQuery = { $and: queryConditions }
    const collation = { locale: 'en' }

    const [boards, totalBoards] = await Promise.all([
      collection
        .aggregate(
          [
            { $match: matchQuery },
            { $sort: { title: 1 } },
            { $skip: pagingSkipValue(page, itemsPerPage) },
            { $limit: itemsPerPage }
          ],
          { collation }
        )
        .toArray(),

      collection.countDocuments(matchQuery, { collation })
    ])

    return {
      boards,
      totalBoards
    }
  }

  static getDetail = async ({ _id }) => {
    try {
      const db = GET_DB()
      const boardObjectId = new ObjectId(_id)
      const boardIdStr = _id

      const [board, columns, cards] = await Promise.all([
        db.collection(boardModel.BOARD_COLLECTION_NAME).findOne({
          _id: boardObjectId
        }),

        db
          .collection(columnModel.COLUMN_COLLECTION_NAME)
          .find({
            boardId: boardIdStr,
            status: 'active'
          })
          .toArray(),

        db
          .collection(cardModel.CARD_COLLECTION_NAME)
          .find(
            {
              boardId: boardIdStr,
              status: 'active'
            },
            {
              projection: {
                status: 0,
                description: 0,
                createdAt: 0,
                updatedAt: 0,
                archivedAt: 0
              }
            }
          )
          .toArray()
      ])

      if (!board) return null

      return {
        ...board,
        columns,
        cards
      }
    } catch (error) {
      throw error
    }
  }

  static createOne = async ({ data, session }) => {
    const validData = await boardModel.validateBeforeCreate(data)
    return GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .insertOne(validData, { session })
  }

  static updateOne = async ({ _id, data, session }) => {
    if (data.columnOrderIds)
      data.columnOrderIds = data.columnOrderIds.map((_id) => new ObjectId(_id))

    const result = await GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: data },
        { returnDocument: 'after', session }
      )
    return result
  }

  static pushColumnOrderIds = async ({ column, session }) => {
    const result = await GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $push: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after', session }
      )
    return result
  }

  static pullColumnOrderIds = async ({ column, session }) => {
    const result = await GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $pull: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after', session }
      )
    return result
  }

  static pushMemberIds = async ({ _id, userId }) => {
    const result = await GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $push: { memberIds: new ObjectId(userId) } },
        { returnDocument: 'after' }
      )
    return result
  }

  static updateMany = async ({ filter, data, session }) => {
    return await GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .updateMany(filter, data, { returnDocument: 'after', session })
  }
}
export default BoardRepo
