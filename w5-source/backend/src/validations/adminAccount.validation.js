import Joi from 'joi'
import { USER_ROLES } from '~/constant/enum/user.enum';
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'

const create = Joi.object({
  avatar: Joi.string().allow(null).default(null),
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string()
    .required()
    .pattern(PASSWORD_RULE)
    .message(PASSWORD_RULE_MESSAGE),
  displayName: Joi.string().required().trim().strict(),
  role: Joi.string().valid(...Object.values(USER_ROLES)).default('client'),
  isActive: Joi.boolean().default(true),
  isBlocked: Joi.boolean().default(false),
  username: Joi.string().required().trim().strict()
})

export const adminAccountValidation = {
  create
}