import Joi from 'joi'
import { visibility } from '~/constant/enum/board.enum'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { optionalIdSchema } from './common.validation'

const create = Joi.object({
  title: Joi.string().required().min(1).max(200).trim().strict().messages({
    'any.required': 'Title is required.',
    'string.empty': 'Title is not allowed to be empty.',
    'string.min': 'Title length must be at least 1 character long.',
    'string.max':
      'Title length must be less than or equal to 200 characters long.',
    'string.trim': 'Title must not have leading or trailing whitespace.'
  }),

  description: Joi.string()
    .min(1)
    .max(4000)
    .allow('')
    .trim()
    .strict()
    .messages({
      'string.min': 'Description length must be at least 1 character long.',
      'string.max':
        'Description length must be less than or equal to 4000 characters long.',
      'string.trim': 'Description must not have leading or trailing whitespace.'
    }),

  visibility: Joi.string()
    .required()
    .valid(...Object.values(visibility))
    .messages({
      'any.required': 'Visibility is required.',
      'any.only': 'Visibility is invalid.'
    }),

  workspaceId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  cover: Joi.object({
    type: Joi.string().valid('color', 'image').required().messages({
      'any.required': 'Cover type is required.',
      'any.only': 'Cover type must be either color or image.'
    }),
    value: Joi.string().required().trim().strict().messages({
      'any.required': 'Cover value is required.',
      'string.empty': 'Cover value is not allowed to be empty.',
      'string.trim': 'Cover value must not have leading or trailing whitespace.'
    })
  }).required()
}).unknown(false)

const update = Joi.object({
  title: Joi.string().min(1).max(200).trim().strict().messages({
    'any.required': 'Title is required.',
    'string.empty': 'Title is not allowed to be empty.',
    'string.min': 'Title length must be at least 1 character long.',
    'string.max':
      'Title length must be less than or equal to 200 characters long.',
    'string.trim': 'Title must not have leading or trailing whitespace.'
  }),

  description: Joi.string()
    .min(1)
    .max(4000)
    .allow('')
    .trim()
    .strict()
    .messages({
      'string.min': 'Description length must be at least 1 character long.',
      'string.max':
        'Description length must be less than or equal to 4000 characters long.',
      'string.trim': 'Description must not have leading or trailing whitespace.'
    }),

  visibility: Joi.string()
    .strict()
    .valid(...Object.values(visibility))
    .messages({
      'any.only': 'Visibility is invalid.'
    }),
  columnOrderIds: Joi.array().items(optionalIdSchema),
  cover: Joi.object({
    type: Joi.string().valid('color', 'image').required(),
    value: Joi.string().required().trim().strict()
  }).default(null)
})

const moveCardToDifferentColumn = Joi.object({
  currentCardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  prevColumnId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  prevCardOrderIds: Joi.array().required().items(optionalIdSchema),

  nextColumnId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  nextCardOrderIds: Joi.array().required().items(optionalIdSchema)
})

export const boardValidation = {
  create,
  update,
  moveCardToDifferentColumn
}
