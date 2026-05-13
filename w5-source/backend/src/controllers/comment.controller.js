import {
  CreatedSuccessResponse,
  OkSuccessResponse
} from '~/core/success.response'
import CommentService from '~/services/comment.service'

class CommentController {
  static create = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await CommentService.create({
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static delete = async (req, res) => {
    new OkSuccessResponse({
      metadata: await CommentService.delete({
        _id: req.params.commentId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }
}
export default CommentController
