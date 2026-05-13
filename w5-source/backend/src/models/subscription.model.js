import Joi from 'joi'
import { SUBSCRIPTION_STATUS } from '~/constant/enum/subscription.enum'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const SUBSCRIPTION_COLLECTION_NAME = 'subscriptions'

const SUBSCRIPTION_COLLECTION_SCHEMA = Joi.object({
  workspaceId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  planId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  status: Joi.string()
    .valid(...SUBSCRIPTION_STATUS)
    .required(),

  planFeatureSnapshot: Joi.object().default({}),

  startedAt: Joi.date().allow(null).default(null),
  endedAt: Joi.date().allow(null).default(null),
  canceledAt: Joi.date().allow(null).default(null),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await SUBSCRIPTION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const subscriptionModel = {
  SUBSCRIPTION_COLLECTION_NAME,
  SUBSCRIPTION_COLLECTION_SCHEMA,
  validateBeforeCreate
}
