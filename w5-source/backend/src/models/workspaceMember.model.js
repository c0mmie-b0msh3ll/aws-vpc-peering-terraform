import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { WORKSPACE_MEMBER_STATUS } from '~/constant/enum/workspaceMember.enum'

const WORKSPACE_MEMBER_COLLECTION_NAME = 'workspaceMembers'

const WORKSPACE_MEMBER_COLLECTION_SCHEMA = Joi.object({
  workspaceId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  userId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  workspaceRoleId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  invitedBy: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .allow(null)
    .required(),

  status: Joi.string()
    .valid(...WORKSPACE_MEMBER_STATUS)
    .default('active'),

  joinAt: Joi.date().allow(null).default(null),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await WORKSPACE_MEMBER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const workspaceMemberModel = {
  WORKSPACE_MEMBER_COLLECTION_NAME,
  WORKSPACE_MEMBER_COLLECTION_SCHEMA,
  validateBeforeCreate
}
