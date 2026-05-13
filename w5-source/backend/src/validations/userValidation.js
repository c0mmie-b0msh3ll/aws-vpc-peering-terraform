import Joi from 'joi'
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE
} from '~/utils/validators'

const create = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string()
    .required()
    .pattern(PASSWORD_RULE)
    .message(PASSWORD_RULE_MESSAGE)
})

const verifyAccount = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  token: Joi.string().required()
})

const login = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string()
    .required()
    .pattern(PASSWORD_RULE)
    .message(PASSWORD_RULE_MESSAGE)
})

const update = Joi.object({
  displayName: Joi.string().trim().strict(),
  current_password: Joi.string()
    .pattern(PASSWORD_RULE)
    .message(`current_password: ${PASSWORD_RULE_MESSAGE}`),
  new_password: Joi.string()
    .pattern(PASSWORD_RULE)
    .message(`new_password: ${PASSWORD_RULE_MESSAGE}`)
})

const forgotPassword = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE)
})

const changePassword = Joi.object({
  password: Joi.string()
    .required()
    .pattern(PASSWORD_RULE)
    .message(`password: ${PASSWORD_RULE_MESSAGE}`),
  token: Joi.string().required(),
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(`email: ${EMAIL_RULE_MESSAGE}`)
})

export const userValidation = {
  create,
  verifyAccount,
  login,
  forgotPassword,
  changePassword,
  update
}
