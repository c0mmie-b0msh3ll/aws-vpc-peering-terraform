import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { sendEmailService } from '~/providers/NodeMailer'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import UserRepo from '~/repo/user.repo'
import {
  ConflictErrorResponse,
  ForbiddenErrorResponse,
  NotFoundErrorResponse
} from '~/core/error.response'
import WorkspaceService from './workspace.service'
import { mongoClientInstance } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

function parseTtlSeconds(ttl) {
  if (!ttl) return 900
  const m = String(ttl).match(/^(\d+)([smhd])?$/)
  if (!m) return 900
  const n = parseInt(m[1], 10)
  const unit = m[2] || 's'
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] || 1
  return n * multiplier
}

class UserService {
  static fetchByUser = async ({ data }) => {
    const keyword = data?.search?.trim() || ''

    if (keyword.length < 3) return []

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const users = await UserRepo.findMany({
      filter: {
        $or: [
          { userEmail: { $regex: escapedKeyword, $options: 'i' } },
          { displayName: { $regex: escapedKeyword, $options: 'i' } }
        ]
      }
    })

    return users
  }

  static create = async ({ data }) => {
    const { email } = data
    const existsUser = await UserRepo.findByEmail({ email })
    if (existsUser) throw new ConflictErrorResponse('Email already exists!')

    const newUser = {
      email: email,
      password: bcryptjs.hashSync(data.password, 8),
      username: email.split('@')[0],
      displayName: email.split('@')[0],
      verifyToken: uuidv4()
    }

    const createdUser = await UserRepo.createOne({ data: newUser })

    const user = await UserRepo.findById({ _id: createdUser.insertedId })

    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${user.email}&token=${user.verifyToken}`

    const customSubject =
      'Trello MERN Stack Advanced: Please verify your email before using our services!'

    const htmlContent = `
     <h3>Here is your verification link:</h3>
     <h3>${verificationLink}</h3>
     <h3>Sincerely</h3>x
   `
    sendEmailService(user.email, customSubject, htmlContent)
    return pickUser(user)
  }

  static verifyAccount = async ({ data }) => {
    const existsUser = await UserRepo.findByEmail({ email: data.email })

    if (!existsUser) throw new NotFoundErrorResponse('Account not found!')

    if (existsUser.isActive)
      throw new ForbiddenErrorResponse('Your account is already active!')

    if (existsUser.verifyToken !== data.token)
      throw new ForbiddenErrorResponse('Token is invalid!')

    const updateData = { isActive: true, verifyToken: null }

    let updatedUser = null

    const session = await mongoClientInstance.startSession()

    try {
      await session.withTransaction(async () => {
        const updatedUser = await UserRepo.updateOne({
          filter: { _id: new ObjectId(existsUser._id) },
          update: { $set: { ...updateData } },
          options: { session }
        })

        const createWorkspaceData = {
          title: `${updatedUser.username}'s Workspace`,
          description:
            'Welcome to your default workspace. Create boards, organize tasks, and collaborate with your team here.'
        }

        await WorkspaceService.create({
          userContext: updatedUser,
          data: createWorkspaceData,
          session
        })
      })
    } finally {
      await session.endSession()
    }

    return pickUser(updatedUser)
  }

  static login = async ({ data }) => {
    const existUser = await UserRepo.findByEmail({ email: data.email })

    if (!existUser) throw new NotFoundErrorResponse('Account not found!')

    if (!existUser.isActive)
      throw new ForbiddenErrorResponse('Your account is not active!')

    if (existUser.isBlocked)
      throw new ForbiddenErrorResponse('Your account is blocked!')

    if (!bcryptjs.compareSync(data.password, existUser.password))
      throw new ForbiddenErrorResponse(
        'Your email or password is not incorrect!'
      )

    const userInfo = { _id: existUser._id, email: existUser.email }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    return { ...pickUser(existUser), accessToken, refreshToken }
  }

  static refreshToken = async ({ clientRefreshToken }) => {
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  }

  static issueAiToken = async ({ _id, email }) => {
    const userInfo = { _id: String(_id), email }
    const token = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.AI_TOKEN_LIFE
    )
    return { token, expiresIn: parseTtlSeconds(env.AI_TOKEN_LIFE) }
  }

  static update = async ({ _id, data, userAvatarFile }) => {
    const existUser = await UserRepo.findById({ _id })

    if (!existUser) throw new NotFoundErrorResponse('Account not found!')

    if (!existUser.isActive)
      throw new ForbiddenErrorResponse('Your account is not active!')

    let updatedUser = {}

    if (data.current_password && data.new_password) {
      if (!bcryptjs.compareSync(data.current_password, existUser.password))
        throw new ForbiddenErrorResponse(
          'Your current password is not correct!'
        )

      updatedUser = await UserRepo.updateById({
        _id,
        data: { password: bcryptjs.hashSync(data.new_password, 8) }
      })
    } else if (userAvatarFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(
        userAvatarFile.buffer,
        'users'
      )
      updatedUser = await UserRepo.updateById({
        _id: existUser._id,
        data: { avatar: uploadResult.secure_url }
      })
    } else {
      updatedUser = await UserRepo.updateById({
        _id: existUser._id,
        data
      })
    }
    return pickUser(updatedUser)
  }

  static forgotPassword = async ({ data }) => {
    const email = data.email
    const existUser = await UserRepo.findByEmail({ email })
    if (!existUser) throw new NotFoundErrorResponse('Account not found!')

    if (!existUser.isActive)
      throw new ForbiddenErrorResponse('Your account has not been activated.')

    const resetPassToken = uuidv4()

    const updatedUser = await UserRepo.updateById({
      _id: existUser._id,
      data: { resetPassToken: resetPassToken }
    })

    const resetPasswordLink = `${WEBSITE_DOMAIN}/auth/change-password?email=${email}&token=${resetPassToken}`

    sendEmailService(
      email,
      'Password Recovery Link',
      `
        <h3>Here is your password recovery link:</h3>
        <h3>${resetPasswordLink}</h3>
        <h3>Sincerely</h3>
      `
    )
    return pickUser(updatedUser)
  }

  static changePassword = async ({ data }) => {
    const checkEmailToken = await UserRepo.findByEmailAndResetPassToken({
      email: data.email,
      resetPassToken: data.token
    })

    if (!checkEmailToken)
      throw new NotFoundErrorResponse(
        'Your password change period has expired.'
      )

    const updateUsers = await UserRepo.updateById({
      _id: checkEmailToken._id,
      data: {
        password: bcryptjs.hashSync(data.password, 8),
        resetPassToken: null
      }
    })
    return pickUser(updateUsers)
  }

  static checkResetPasswordToken = async ({ data }) => {
    const checkEmailToken = await UserRepo.findByEmailAndResetPassToken({
      email: data.email,
      resetPassToken: data.token
    })

    if (!checkEmailToken)
      throw new NotFoundErrorResponse(
        'Your password change period has expired.'
      )
    return pickUser(checkEmailToken)
  }
}
export default UserService
