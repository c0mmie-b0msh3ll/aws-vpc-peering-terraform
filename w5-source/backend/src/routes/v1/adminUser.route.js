import express from 'express'
import AdminUserController from '~/controllers/adminUser.controller'
import asyncHandler from '~/helpers/asyncHandler'
import validate from '~/utils/validate'
import { adminAccountValidation } from '~/validations/adminAccount.validation'

const Router = express.Router()

Router.route('/')
  .get(asyncHandler(AdminUserController.fetchByUser))
  .post(
    asyncHandler(validate(adminAccountValidation.create)),
    asyncHandler(AdminUserController.createAdminAccount)
  )
Router.route('/block/:userId').patch(
  asyncHandler(AdminUserController.updateBlockUser)
)
Router.route('/:userId').put(asyncHandler(AdminUserController.updateAdminUser))

export const adminUserRoute = Router
