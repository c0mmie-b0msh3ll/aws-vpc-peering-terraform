import { OkSuccessResponse } from '~/core/success.response'
import AttachmentService from '~/services/attachment.service'

class AttachmentController {
  static upload = async (req, res) => {
    new OkSuccessResponse({
      metadata: await AttachmentService.upload({
        boardAccess: req.boardAccess,
        cardId: req.body.cardId,
        files: req.files
      })
    }).send(res)
  }

  static download = async (req, res) => {
    new OkSuccessResponse({
      metadata: await AttachmentService.download({
        _id: req.params.attachmentId,
        userContext: req.userContext
      })
    }).send(res)
  }

  static update = async (req, res) => {
    new OkSuccessResponse({
      metadata: await AttachmentService.update({
        _id: req.params.attachmentId,
        userContext: req.userContext,
        data: req.body
      })
    }).send(res)
  }

  static delete = async (req, res) => {
    new OkSuccessResponse({
      metadata: await AttachmentService.delete({
        _id: req.params.attachmentId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }
}
export default AttachmentController
