import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const CARD_COMMENT_COLLECTION_NAME = 'cardComments'

const CARD_COMMENT_COLLECTION_SCHEMA = Joi.object({
  cardId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  boardMemberId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  content: Joi.string().required(),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await CARD_COMMENT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const cardCommentModel = {
  CARD_COMMENT_COLLECTION_NAME,
  CARD_COMMENT_COLLECTION_SCHEMA,
  validateBeforeCreate
}
