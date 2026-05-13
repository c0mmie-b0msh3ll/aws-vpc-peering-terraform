import Joi from 'joi'
import { PLAN_BILLING_CYCLE, PLAN_STATUS } from '~/constant/enum/plan.enum'

const PLAN_COLLECTION_NAME = 'plans'

const PLAN_COLLECTION_SCHEMA = Joi.object({
  code: Joi.string().required().min(3).max(30).trim().strict(),

  title: Joi.string().required().min(3).max(30).trim().strict(),

  billingCycle: Joi.string()
    .valid(...PLAN_BILLING_CYCLE)
    .default('monthly'),

  description: Joi.string()
    .min(20)
    .max(255)
    .trim()
    .strict()
    .allow('')
    .default(''),

  originPrice: Joi.number().min(0).required(),

  currentPrice: Joi.number().min(0).required(),

  status: Joi.string()
    .valid(...PLAN_STATUS)
    .default('active'),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

export const planModel = {
  PLAN_COLLECTION_NAME,
  PLAN_COLLECTION_SCHEMA
}
