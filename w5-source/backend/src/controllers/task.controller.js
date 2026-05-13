import { CreatedSuccessResponse } from '~/core/success.response'
import TaskService from '~/services/task.service'

class TaskController {
  static create = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await TaskService.create({
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static update = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await TaskService.update({
        _id: req.params.taskId,
        boardAccess: req.boardAccess,
        data: req.body
      })
    }).send(res)
  }

  static delete = async (req, res) => {
    new CreatedSuccessResponse({
      metadata: await TaskService.delete({
        _id: req.params.taskId,
        boardAccess: req.boardAccess
      })
    }).send(res)
  }
}

export default TaskController
