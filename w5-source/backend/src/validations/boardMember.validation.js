import Joi from 'joi'
import { idSchema } from './common.validation'

const updateAndDeleteBoardMemberParamSchema = Joi.object({
  boardId: idSchema,
  memberId: idSchema
})
export const boardMemberValidation = { updateAndDeleteBoardMemberParamSchema }
