import { GET_DB } from '~/config/mongodb'
import { boardPermissionModel } from '~/models/boardPermission.model'

class BoardPermissionRepo {
  static findMany = async ({ filter = {}, options = {} }) => {
    return await GET_DB()
      .collection(boardPermissionModel.BOARD_PERMISSION_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }
}
export default BoardPermissionRepo
