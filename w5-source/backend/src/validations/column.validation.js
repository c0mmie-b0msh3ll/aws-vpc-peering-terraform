import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { idSchema } from './common.validation'

const create = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .messages({
      'any.required': 'Board id is required.',
      'string.empty': 'Board id is not allowed to be empty.'
    }),

  title: Joi.string().required().min(1).max(500).trim().strict().messages({
    'any.required': 'Title is required.',
    'string.empty': 'Title is not allowed to be empty.',
    'string.min': 'Title length must be at least 1 character long.',
    'string.max':
      'Title length must be less than or equal to 500 characters long.',
    'string.trim': 'Title must not have leading or trailing whitespace.'
  }),

  color: Joi.string().messages({
    'string.base': 'Color must be a string.'
  })
})

const update = Joi.object({
  title: Joi.string().min(3).max(50).trim().strict(),
  cardOrderIds: Joi.array().items(idSchema)
}).options({ allowUnknown: true })

const updateAndDeleteColumnParamSchema = Joi.object({
  boardId: idSchema,
  columnId: idSchema
})

export const columnValidation = {
  create,
  update,
  updateAndDeleteColumnParamSchema
}
