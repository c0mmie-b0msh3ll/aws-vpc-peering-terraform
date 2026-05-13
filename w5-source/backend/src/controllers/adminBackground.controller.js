import { OkSuccessResponse } from '~/core/success.response'
import AdminBackgroundService from '~/services/adminBackground.service'

class AdminBackgroundController {
  static createAdminBackground = async (req, res) => {
    const backgroundData = {
      entity: req.body.entity,
      title: req.body.title,
      status: req.body.status,
      file: req.file
    }

    new OkSuccessResponse({
      metadata: await AdminBackgroundService.createBackground({
        backgroundData
      })
    }).send(res)
  }

  static updateAdminBackground = async (req, res) => {
    const backgroundData = {
      entity: req.body.entity,
      title: req.body.title,
      status: req.body.status,
      file: req.file || req.body.image
    }
    const { _id } = req.params
    new OkSuccessResponse({
      metadata: await AdminBackgroundService.updateBackground({
        _id: _id,
        data: backgroundData
      })
    }).send(res)
  }

  static getAdminBackgrounds = async (req, res) => {
    new OkSuccessResponse({
      metadata: await AdminBackgroundService.fetchBackgrounds({
        data: req.query
      })
    }).send(res)
  }

  static updateBlockBackground = async (req, res) => {
    const { backgroundId } = req.params
    new OkSuccessResponse({
      metadata: await AdminBackgroundService.updateBlockBackground({
        backgroundId
      })
    }).send(res)
  }

  static deleteAdminBackground = async (req, res) => {
    const { _id } = req.params

    new OkSuccessResponse({
      metadata: await AdminBackgroundService.deleteBlockBackground({
        _id: _id
      })
    }).send(res)
  }
}
export default AdminBackgroundController
