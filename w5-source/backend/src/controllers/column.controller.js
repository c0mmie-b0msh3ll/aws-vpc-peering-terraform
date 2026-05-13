import {
  CreatedSuccessResponse,
  OkSuccessResponse
} from '~/core/success.response'
import ColumnService from '~/services/column.service'

class ColumnController {
  static fetchArchived = async (req, res) => {
    new OkSuccessResponse({
      metadata: await ColumnService.fetchArchived({
        boardId: req.params.boardId
      })
    }).send(res)
  }

  static create = async (req, res) => {
    new CreatedSuccessResponse({
      message: 'Create new column successfully.',
      metadata: await ColumnService.create({
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static update = async (req, res) => {
    new OkSuccessResponse({
      message: 'Update column successfully.',
      metadata: await ColumnService.update({
        _id: req.params.columnId,
        data: req.body,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }

  static archive = async (req, res) => {
    new OkSuccessResponse({
      message: 'Archive column successfully.',
      metadata: await ColumnService.archive({
        _id: req.params.columnId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }

  static restore = async (req, res) => {
    new OkSuccessResponse({
      message: 'Restore column successfully.',
      metadata: await ColumnService.restore({
        _id: req.params.columnId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }

  static delete = async (req, res) => {
    new OkSuccessResponse({
      message: 'Delete column successfully.',
      metadata: await ColumnService.delete({
        _id: req.params.columnId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }
}
export default ColumnController
