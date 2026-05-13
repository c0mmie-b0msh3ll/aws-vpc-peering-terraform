import { GET_DB } from '~/config/mongodb'
import { activityLogModel } from '~/models/activityLog.model'

class ActivityLogRepo {
  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(activityLogModel.ACTIVITY_LOG_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(activityLogModel.ACTIVITY_LOG_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static createOne = async ({ data, session }) => {
    const validData = await activityLogModel.validateBeforeCreate(data)
    return GET_DB()
      .collection(activityLogModel.ACTIVITY_LOG_COLLECTION_NAME)
      .insertOne(validData, { session })
  }
}
export default ActivityLogRepo
