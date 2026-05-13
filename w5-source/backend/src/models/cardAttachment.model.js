import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const CARD_ATTACHMENT_NAME = 'cardAttachments'

const CARD_ATTACHMENT_COLLECTION_SCHEMA = Joi.object({
  cardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  fileName: Joi.string().required().min(1).max(255).trim().strict(),

  fileKey: Joi.string().required().trim().strict(),

  fileType: Joi.string().trim().strict().allow('').default(''),

  fileSize: Joi.number().integer().min(0).default(0),

  uploadedBy: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await CARD_ATTACHMENT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const attachmentModel = {
  CARD_ATTACHMENT_NAME,
  CARD_ATTACHMENT_COLLECTION_SCHEMA,
  validateBeforeCreate
}
