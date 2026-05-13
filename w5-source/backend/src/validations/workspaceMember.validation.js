import Joi from 'joi'
import { idSchema } from './common.validation'

const updateAndDeleteWorkspaceMemberParamSchema = Joi.object({
  workspaceId: idSchema,
  memberId: idSchema
})

export const workspaceMemberValidation = {
  updateAndDeleteWorkspaceMemberParamSchema
}
