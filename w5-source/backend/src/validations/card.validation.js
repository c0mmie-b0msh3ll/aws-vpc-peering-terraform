import Joi from 'joi'
import { idSchema } from './common.validation'

const create = Joi.object({
  boardId: idSchema,
  columnId: idSchema,
  title: Joi.string().required().min(1).max(500).trim().strict().messages({
    'any.required': 'Title is required.',
    'string.empty': 'Title is not allowed to be empty.',
    'string.min': 'Title length must be at least 1 character long.',
    'string.max':
      'Title length must be less than or equal to 500 characters long.',
    'string.trim': 'Title must not have leading or trailing whitespace.'
  })
})

const update = Joi.object({
  title: Joi.string().min(3).max(50).trim().strict(),
  description: Joi.string().optional()
}).options({ allowUnknown: true })

const updateAndDeleteCardParamSchema = Joi.object({
  boardId: idSchema,
  cardId: idSchema
})

export const cardValidation = {
  create,
  update,
  updateAndDeleteCardParamSchema
}
