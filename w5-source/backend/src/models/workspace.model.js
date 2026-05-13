import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { WORKSPACE_STATUS } from '~/constant/enum/workspace.enum'

const WORKSPACE_COLLECTION_NAME = 'workspaces'

const WORKSPACE_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),

  description: Joi.string().max(255).trim().strict().allow('').default(''),

  createdBy: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  status: Joi.string()
    .valid(...WORKSPACE_STATUS)
    .default('active'),

  storageUsed: Joi.number().integer().min(0).default(0),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await WORKSPACE_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const workspaceModel = {
  WORKSPACE_COLLECTION_NAME,
  WORKSPACE_COLLECTION_SCHEMA,
  validateBeforeCreate
}
