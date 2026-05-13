import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { env } from '~/config/environment'
import UserService from '~/services/user.service'
import {
  CreatedSuccessResponse,
  OkSuccessResponse
} from '~/core/success.response'

class UserController {
  static fetchByUser = async (req, res) => {
    new OkSuccessResponse({
      metadata: await UserService.fetchByUser({ data: req.query })
    }).send(res)
  }

  static create = async (req, res) => {
    new CreatedSuccessResponse({
      message:
        'User created successfully! Please check your email to verify your account before using our services!',
      metadata: await UserService.create({ data: req.body })
    }).send(res)
  }

  static verifyAccount = async (req, res) => {
    new OkSuccessResponse({
      message:
        'Account verified successfully! You can login to your account now!',
      metadata: await UserService.verifyAccount({ data: req.body })
    }).send(res)
  }

  static login = async (req, res) => {
    const result = await UserService.login({ data: req.body })

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sampleSite: 'none',
      maxAge: ms(env.REFRESH_TOKEN_LIFE)
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sampleSite: 'none',
      maxAge: ms(env.REFRESH_TOKEN_LIFE)
    })

    new OkSuccessResponse({
      message: 'Login successfully!',
      metadata: result
    }).send(res)
  }

  static logout = async (req, res) => {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ loggedOut: true })
  }

  static refreshToken = async (req, res) => {
    const result = await UserService.refreshToken({
      clientRefreshToken: req?.cookies?.refreshToken
    })

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sampleSite: 'none',
      maxAge: ms(env.REFRESH_TOKEN_LIFE)
    })
    res.status(StatusCodes.OK).json({ result })
  }

  static issueAiToken = async (req, res) => {
    const { _id, email } = req.userContext
    const result = await UserService.issueAiToken({ _id, email })
    new OkSuccessResponse({
      message: 'AI token issued',
      metadata: result
    }).send(res)
  }

  static update = async (req, res) => {
    new OkSuccessResponse({
      message: 'User updated successfully!',
      metadata: await UserService.update({
        _id: req.userContext._id,
        data: req.body,
        userAvatarFile: req.file
      })
    }).send(res)
  }

  static forgotPassword = async (req, res) => {
    const result = await UserService.forgotPassword({ data: req.body })
    new OkSuccessResponse({
      message: 'Recovery link sent successfully! Please check your email!',
      metadata: result
    }).send(res)
  }

  static changePassword = async (req, res) => {
    const result = await UserService.changePassword({
      data: req.body
    })
    new OkSuccessResponse({
      message:
        'Password changed successfully! Please login with your new password.',
      metadata: result
    }).send(res)
  }

  static checkResetPasswordToken = async (req, res) => {
    await UserService.checkResetPasswordToken({
      data: req.body
    })
    new OkSuccessResponse({
      message: 'Reset password link verified! Please enter your new password.'
    }).send(res)
  }
}
export default UserController
