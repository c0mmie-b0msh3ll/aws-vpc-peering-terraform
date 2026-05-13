import Joi from 'joi'

const BOARD_PERMISSION_COLLECTION_NAME = 'boardPermissions'

const BOARD_PERMISSION_COLLECTION_SCHEMA = Joi.object({
  permissionCode: Joi.string().required().min(3).max(50).trim().strict(),

  description: Joi.string().required().min(3).max(255).trim().strict(),

  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null)
})

export const boardPermissionModel = {
  BOARD_PERMISSION_COLLECTION_NAME,
  BOARD_PERMISSION_COLLECTION_SCHEMA
}
