import Joi from 'joi'
import { BACKGROUND_ENTITY, BACKGROUND_STATUS } from '~/constant/enum/background.enum'

const create = Joi.object({
  entity: Joi.string()
    .required()
    .valid(...BACKGROUND_ENTITY),

  title: Joi.string()
    .required()
    .min(3)
    .max(100)
    .trim()
    .strict(),

  status: Joi.string()
    .valid(...BACKGROUND_STATUS)
    .default('active')
})

export const adminBackgroundValidation = {
  create
}