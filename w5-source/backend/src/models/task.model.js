import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const TASK_COLLECTION_NAME = 'tasks'

const TASK_COLLECTION_SCHEMA = Joi.object({
  cardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  content: Joi.string().trim().strict().required(),

  parentTaskId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .allow(null)
    .default(null),

  memberId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .allow(null)
    .default(null),

  isCompleted: Joi.boolean().default(false),

  dueAt: Joi.date().allow(null).default(null),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await TASK_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const taskModel = {
  validateBeforeCreate,
  TASK_COLLECTION_NAME,
  TASK_COLLECTION_SCHEMA
}
