import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { PAYMENT_STATUS, PAYMENT_GATEWAYS } from '~/constant/enum/payment.enum'

const PAYMENT_COLLECTION_NAME = 'payments'

const PAYMENT_COLLECTION_SCHEMA = Joi.object({
  subscriptionId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  gateway: Joi.string()
    .required()
    .valid(...PAYMENT_GATEWAYS),

  status: Joi.string()
    .valid(...PAYMENT_STATUS)
    .default('pending'),

  providerTransactionId: Joi.string().trim().strict().allow(null).default(null),

  amount: Joi.number().required().min(0),

  paidAt: Joi.date().allow(null).default(null),
  failedAt: Joi.date().allow(null).default(null),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

export const paymentModel = {
  PAYMENT_COLLECTION_NAME,
  PAYMENT_COLLECTION_SCHEMA
}
