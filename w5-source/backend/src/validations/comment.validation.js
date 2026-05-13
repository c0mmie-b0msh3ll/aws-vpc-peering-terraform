import Joi from 'joi'
import { idSchema } from './common.validation'
const deleteCommentParamSchema = Joi.object({
  boardId: idSchema,
  commentId: idSchema
})
export const commentValidation = { deleteCommentParamSchema }
