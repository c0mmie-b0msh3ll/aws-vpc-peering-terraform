import Joi from 'joi'
import { idSchema } from './common.validation'

const deleteBoardRoleParamSchema = Joi.object({
  boardId: idSchema,
  roleId: idSchema
})
export { deleteBoardRoleParamSchema }
