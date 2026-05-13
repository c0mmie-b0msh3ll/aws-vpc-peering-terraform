import { GET_DB } from '~/config/mongodb'
import { workspacePermissionModel } from '~/models/workspacePermission.model'

class WorkspacePermissionRepo {
  static findMany = async ({ filter = {}, options = {} }) => {
    return await GET_DB()
      .collection(workspacePermissionModel.WORKSPACE_PERMISSION_COLLECTION_NAME)
      .find(filter, options)
      .toArray()
  }
}
export default WorkspacePermissionRepo
