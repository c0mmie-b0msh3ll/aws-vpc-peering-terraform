import {
  OkSuccessResponse
} from '~/core/success.response'
import AdminUserService from '~/services/adminUser.service'

class AdminUserController {
  static fetchByUser = async (req, res) => {
    new OkSuccessResponse({
      metadata: await AdminUserService.fetchByUser({ data: req.query })
    }).send(res)
  }

  static updateBlockUser = async (req, res) => {
    const { userId } = req.params
    new OkSuccessResponse({
      metadata: await AdminUserService.updateBlockUser({ userId })
    }).send(res)
  }

  static updateAdminUser = async (req, res) => {
    const { userId } = req.params
    const userData = req.body
    new OkSuccessResponse({
      metadata: await AdminUserService.updateAdminUser({ _id: userId, data: userData })
    }).send(res)
  }

  static createAdminAccount = async (req, res) => {
    const userData = req.body
    new OkSuccessResponse({
      metadata: await AdminUserService.createAdminAccount({ userData })
    }).send(res)
    }
}
export default AdminUserController
