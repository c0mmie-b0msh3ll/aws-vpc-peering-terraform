import Joi from 'joi'
import { BACKGROUND_ENTITY, BACKGROUND_STATUS } from '~/constant/enum/background.enum'

const BACKGROUND_COLLECTION_NAME = 'backgrounds'

const BACKGROUND_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(100).trim().strict(),

  image: Joi.string().required().trim().strict(),

  entity: Joi.string()
    .required()
    .valid(...BACKGROUND_ENTITY),

  status: Joi.string()
    .valid(...BACKGROUND_STATUS)
    .default('active'),

  isDelete: Joi.boolean().default(false),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await BACKGROUND_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const backgroundModel = {
  BACKGROUND_COLLECTION_NAME,
  BACKGROUND_COLLECTION_SCHEMA,
  validateBeforeCreate
}