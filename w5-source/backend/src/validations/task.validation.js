import Joi from 'joi'
import { idSchema } from './common.validation'
const updateAndDeleteTaskParamSchema = Joi.object({
  boardId: idSchema,
  taskId: idSchema
})
export const taskValidation = { updateAndDeleteTaskParamSchema }
