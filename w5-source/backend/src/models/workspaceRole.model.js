import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const WORKSPACE_ROLE_COLLECTION_NAME = 'workspaceRoles'

const WORKSPACE_ROLE_COLLECTION_SCHEMA = Joi.object({
  workspaceId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  name: Joi.string().required().min(3).max(255).trim().strict(),
  key: Joi.string().allow('').optional(),
  isDefault: Joi.boolean().default(false),

  permissionCodes: Joi.array().items(Joi.string().required()),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await WORKSPACE_ROLE_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const workspaceRoleModel = {
  WORKSPACE_ROLE_COLLECTION_NAME,
  WORKSPACE_ROLE_COLLECTION_SCHEMA,
  validateBeforeCreate
}
