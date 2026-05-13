import Joi from 'joi'
import { TICKET_CREATED_BY } from '~/constant/enum/ticket.enum'
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE
} from '~/utils/validators'

const TICKET_COLLECTION_NAME = 'tickets'

const TICKET_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),

  type: Joi.string().required(),

  content: Joi.string().required(),

  handlerId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .default(''),

  status: Joi.string().default('pending'),

  createdBy: Joi.string()
    .valid(...TICKET_CREATED_BY)
    .required(),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

export const templateModel = {
  TICKET_COLLECTION_NAME,
  TICKET_COLLECTION_SCHEMA
}
