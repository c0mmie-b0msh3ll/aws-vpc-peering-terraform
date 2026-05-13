import Joi from 'joi'
import { CARD_STATUS } from '~/constant/enum/card.enum'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const CARD_COVER_SCHEMA = Joi.object({
  type: Joi.string().valid('color', 'image').required(),
  value: Joi.string().required().trim().strict()
}).default(null)

const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  columnId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(1).max(500).trim().strict(),

  description: Joi.string().max(2000).trim().strict().allow('').default(''),

  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  labelIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  cover: CARD_COVER_SCHEMA,

  commentCount: Joi.number().default(0),

  taskCount: Joi.number().default(0),

  completedTaskCount: Joi.number().default(0),

  isHasDescription: Joi.boolean().default(false),

  attachmentCount: Joi.number().default(0),

  archivedAt: Joi.date().allow(null).default(null),
  startedAt: Joi.date().allow(null).default(null),
  dueAt: Joi.date().allow(null).default(null),

  isCompleted: Joi.boolean().default(false),

  status: Joi.string()
    .valid(...CARD_STATUS)
    .default('active'),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  validateBeforeCreate
}
