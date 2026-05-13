import Joi from 'joi'
import { idSchema } from './common.validation'
const updateAndDeleteAttachmentParamSchema = Joi.object({
  boardId: idSchema,
  attachmentId: idSchema
})
export const attachmentValidation = { updateAndDeleteAttachmentParamSchema }
