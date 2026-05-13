import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const BOARD_ROLE_COLLECTION_NAME = 'boardRoles'

const BOARD_ROLE_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  name: Joi.string().required().min(3).max(255).trim().strict(),

  permissionCodes: Joi.array().items(Joi.string().required()),

  key: Joi.string().allow('').optional(),
  isDefault: Joi.boolean().default(false),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await BOARD_ROLE_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const boardRoleModel = {
  BOARD_ROLE_COLLECTION_NAME,
  BOARD_ROLE_COLLECTION_SCHEMA,
  validateBeforeCreate
}
