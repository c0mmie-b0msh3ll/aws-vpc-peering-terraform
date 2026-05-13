import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const BOARD_LABEL_COLLECTION_NAME = 'boardLabels'

const BOARD_LABEL_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  title: Joi.string().max(50).trim().allow(''),

  color: Joi.string().required(),

  createdBy: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await BOARD_LABEL_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const boardLabelModel = {
  validateBeforeCreate,
  BOARD_LABEL_COLLECTION_NAME,
  BOARD_LABEL_COLLECTION_SCHEMA
}
