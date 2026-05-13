import Joi from 'joi'
import { BOARD_MEMBER_STATUS } from '~/constant/enum/boardMember.enum'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const BOARD_MEMBER_COLLECTION_NAME = 'boardMembers'

const BOARD_MEMBER_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  workspaceMemberId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .default(null),

  boardRoleId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  invitedBy: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE)
    .required(),

  status: Joi.string()
    .valid(...BOARD_MEMBER_STATUS)
    .default('active'),

  joinAt: Joi.date().allow(null).default(null),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

const validateBeforeCreate = async (data) => {
  return await BOARD_MEMBER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const boardMemberModel = {
  BOARD_MEMBER_COLLECTION_NAME,
  BOARD_MEMBER_COLLECTION_SCHEMA,
  validateBeforeCreate
}
