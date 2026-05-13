import Joi from 'joi'
import { idSchema } from './common.validation'
const updateAndDeleteLabelParamSchema = Joi.object({
  boardId: idSchema,
  labelId: idSchema
})
export const labelValidation = { updateAndDeleteLabelParamSchema }
