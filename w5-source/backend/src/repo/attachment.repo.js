import { GET_DB } from '~/config/mongodb'
import { attachmentModel } from '~/models/cardAttachment.model'

class AttachmentRepo {
  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(attachmentModel.CARD_ATTACHMENT_NAME)
      .find(filter, options)
      .toArray()
  }

  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(attachmentModel.CARD_ATTACHMENT_NAME)
      .findOne(filter, options)
  }

  static createMany = async ({ data, session }) => {
    const validData = await Promise.all(
      data.map((d) => attachmentModel.validateBeforeCreate(d))
    )

    return await GET_DB()
      .collection(attachmentModel.CARD_ATTACHMENT_NAME)
      .insertMany(validData, { session })
  }

  static updateOne = async ({ filter, data, session }) => {
    return await GET_DB()
      .collection(attachmentModel.CARD_ATTACHMENT_NAME)
      .findOneAndUpdate(filter, data, { session, returnDocument: 'after' })
  }

  static deleteOne = async ({ filter, session }) => {
    return await GET_DB()
      .collection(attachmentModel.CARD_ATTACHMENT_NAME)
      .deleteOne(filter, { session })
  }

  static deleteMany = async ({ filter, session }) => {
    return await GET_DB()
      .collection(attachmentModel.CARD_ATTACHMENT_NAME)
      .deleteMany(filter, { session })
  }
}
export default AttachmentRepo
