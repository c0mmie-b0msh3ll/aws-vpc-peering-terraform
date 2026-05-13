import { OkSuccessResponse } from '~/core/success.response'
import LabelService from '~/services/label.service'

class LabelController {
  static create = async (req, res) => {
    new OkSuccessResponse({
      metadata: await LabelService.create({
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static update = async (req, res) => {
    new OkSuccessResponse({
      metadata: await LabelService.update({
        _id: req.params.labelId,
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static delete = async (req, res) => {
    new OkSuccessResponse({
      metadata: await LabelService.delete({
        _id: req.params.labelId,
        userContext: req.userContext
      })
    }).send(res)
  }
}
export default LabelController
