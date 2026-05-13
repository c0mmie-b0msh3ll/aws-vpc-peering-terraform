import { GET_DB } from '~/config/mongodb'
import { taskModel } from '~/models/task.model'

class TaskRepo {
  static getListByCardId = async ({ cardId, options = {} }) => {
    const db = GET_DB()
    const rootSort = options.sort || { createdAt: 1 }
    const childSort = options.childSort || { createdAt: 1 }

    // 1. root tasks
    const rootTasks = await db
      .collection(taskModel.TASK_COLLECTION_NAME)
      .find({
        cardId,
        parentTaskId: null
      })
      .sort(rootSort)
      .toArray()

    if (!rootTasks.length) return []

    // 2. lấy tất cả child tasks
    const parentIds = rootTasks.map((t) => String(t._id))

    const childTasks = await db
      .collection(taskModel.TASK_COLLECTION_NAME)
      .find({
        cardId,
        parentTaskId: { $in: parentIds }
      })
      .sort(childSort)
      .toArray()

    // 3. group child theo parent
    const childMap = new Map()

    for (const child of childTasks) {
      const key = child.parentTaskId
      if (!childMap.has(key)) childMap.set(key, [])
      childMap.get(key).push(child)
    }

    // 4. attach vào root
    const result = rootTasks.map((root) => ({
      ...root,
      childTasks: childMap.get(String(root._id)) || []
    }))

    return result
  }

  static findOne = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(taskModel.TASK_COLLECTION_NAME)
      .findOne(filter, options)
  }

  static findMany = async ({ filter, options = {} }) => {
    return await GET_DB()
      .collection(taskModel.TASK_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }

  static createOne = async ({ data, session }) => {
    const validData = await taskModel.validateBeforeCreate(data)
    return await GET_DB()
      .collection(taskModel.TASK_COLLECTION_NAME)
      .insertOne(validData, { session })
  }

  static updateOne = async ({ filter, data, session }) => {
    return await GET_DB()
      .collection(taskModel.TASK_COLLECTION_NAME)
      .findOneAndUpdate(filter, data, { session, returnDocument: 'after' })
  }

  static deleteOne = async ({ filter, session }) => {
    return await GET_DB()
      .collection(taskModel.TASK_COLLECTION_NAME)
      .deleteOne(filter, { session })
  }

  static deleteMany = async ({ filter, session }) => {
    return await GET_DB()
      .collection(taskModel.TASK_COLLECTION_NAME)
      .deleteMany(filter, { session })
  }
}

export default TaskRepo
