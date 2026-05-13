import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const ACTIVITY_LOG_COLLECTION_NAME = 'activityLogs'

const ACTIVITY_LOG_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  authorId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  authorType: Joi.string().required(),

  entityType: Joi.string().required(),

  entityId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  action: Joi.string().required(),

  content: Joi.string().required(),

  createdAt: Joi.date().default(() => new Date())
})

const validateBeforeCreate = async (data) => {
  return await ACTIVITY_LOG_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const activityLogModel = {
  validateBeforeCreate,
  ACTIVITY_LOG_COLLECTION_NAME,
  ACTIVITY_LOG_COLLECTION_SCHEMA
}
