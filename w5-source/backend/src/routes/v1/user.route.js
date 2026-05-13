import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { authMiddleware } from '~/middlewares/auth.middleware'
import UserController from '~/controllers/user.controller'
import asyncHandler from '~/helpers/asyncHandler'
import validate from '~/utils/validate'

const Router = express.Router()

Router.route('/register').post(
  asyncHandler(validate(userValidation.create)),
  asyncHandler(UserController.create)
)

Router.route('/verify').put(
  asyncHandler(validate(userValidation.verifyAccount)),
  asyncHandler(UserController.verifyAccount)
)

Router.route('/login').post(
  asyncHandler(validate(userValidation.login)),
  asyncHandler(UserController.login)
)

Router.route('/logout').delete(asyncHandler(UserController.logout))

Router.route('/refresh_token').put(asyncHandler(UserController.refreshToken))

Router.route('/ai-token').post(
  asyncHandler(authMiddleware.isAuthorized),
  asyncHandler(UserController.issueAiToken)
)

Router.route('/update').put(
  asyncHandler(authMiddleware.isAuthorized),
  // asyncHandler(multerUploadMiddleware.uploadSingleImage.single('avatar')),
  asyncHandler(validate(userValidation.update)),
  asyncHandler(UserController.update)
)

Router.route('/forgot_password').post(
  asyncHandler(validate(userValidation.forgotPassword)),
  asyncHandler(UserController.forgotPassword)
)

Router.route('/change_password').post(
  asyncHandler(validate(userValidation.changePassword)),
  asyncHandler(UserController.changePassword)
)

Router.route('/verify_reset_password_token').post(
  asyncHandler(UserController.checkResetPasswordToken)
)

Router.route('/').get(asyncHandler(UserController.fetchByUser))

export const userRoute = Router
