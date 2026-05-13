import { GET_DB } from '~/config/mongodb'
import { boardLabelModel } from '~/models/boardLabel.model'

class LabelRepo {
  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(boardLabelModel.BOARD_LABEL_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(boardLabelModel.BOARD_LABEL_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static createOne = async ({ data, session }) => {
    const validData = await boardLabelModel.validateBeforeCreate(data)

    return await GET_DB()
      .collection(boardLabelModel.BOARD_LABEL_COLLECTION_NAME)
      .insertOne(validData, { session })
  }

  static createMany = async ({ data, session }) => {
    const validData = await Promise.all(
      data.map((d) => boardLabelModel.validateBeforeCreate(d))
    )

    return await GET_DB()
      .collection(boardLabelModel.BOARD_LABEL_COLLECTION_NAME)
      .insertMany(validData, { session })
  }

  static updateOne = async ({ filter, data, session }) => {
    return await GET_DB()
      .collection(boardLabelModel.BOARD_LABEL_COLLECTION_NAME)
      .findOneAndUpdate(filter, data, { session, returnDocument: 'after' })
  }

  static deleteOne = async ({ filter, session }) => {
    return await GET_DB()
      .collection(boardLabelModel.BOARD_LABEL_COLLECTION_NAME)
      .deleteOne(filter, { session })
  }
}
export default LabelRepo
