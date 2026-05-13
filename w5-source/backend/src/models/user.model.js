import Joi from 'joi'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { USER_ROLES } from '~/constant/enum/user.enum'

const USER_COLLECTION_NAME = 'users'

const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),

  password: Joi.string().required(),

  avatar: Joi.string().allow(null).default(null),

  username: Joi.string().required().trim().strict(),

  displayName: Joi.string().required().trim().strict(),

  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .default(USER_ROLES.CLIENT),

  isActive: Joi.boolean().default(false),

  isBlocked: Joi.boolean().default(false),

  verifyToken: Joi.string(),

  resetPassToken: Joi.string().default(null),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  validateBeforeCreate
}
