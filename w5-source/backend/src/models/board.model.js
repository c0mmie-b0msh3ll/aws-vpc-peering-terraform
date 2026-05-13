import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import {
  BOARD_STATUS,
  BOARD_TYPE,
  visibility
} from '~/constant/enum/board.enum'

const BOARD_COLLECTION_NAME = 'boards'

const BOARD_COVER_SCHEMA = Joi.object({
  type: Joi.string().valid('color', 'image').required(),
  value: Joi.string().required().trim().strict()
}).default(null)

const BOARD_COLLECTION_SCHEMA = Joi.object({
  workspaceId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  title: Joi.string().required().min(1).max(200).trim().strict(),

  description: Joi.string()
    .min(1)
    .max(4000)
    .trim()
    .strict()
    .allow('')
    .default(''),

  visibility: Joi.string()
    .required()
    .valid(...visibility),

  type: Joi.string()
    .valid(...BOARD_TYPE)
    .default('normal'),

  cover: BOARD_COVER_SCHEMA,

  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdBy: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  status: Joi.string()
    .valid(...BOARD_STATUS)
    .default('active'),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  validateBeforeCreate
}
