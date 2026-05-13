import bcryptjs from 'bcryptjs'
import { ObjectId } from 'mongodb'
import { NotFoundErrorResponse } from '~/core/error.response'
import UserRepo from '~/repo/user.repo'

class AdminUserService {
  static fetchByUser = async ({ data }) => {
    const keyword = data?.search?.trim() || ''
    const page = Number(data?.page || 1)
    const limit = Number(data?.limit || 8)
    const skip = (page - 1) * limit

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const filter = keyword
      ? {
          $or: [
            { userEmail: { $regex: escapedKeyword, $options: 'i' } },
            { displayName: { $regex: escapedKeyword, $options: 'i' } },
            { username: { $regex: escapedKeyword, $options: 'i' } }
          ]
        }
      : {}

    const [users, totalCount] = await Promise.all([
      UserRepo.findManyWithPagination({
        filter,
        skip,
        limit
      }),
      UserRepo.countDocuments({ filter })
    ])

    return {
      users,
      totalCount,
      page,
      limit
    }
  }

  static updateBlockUser = async ({ userId }) => {
    const user = await UserRepo.findById({ _id: userId })
    if (!user) throw new NotFoundErrorResponse('User not found!')

    const updatedUser = await UserRepo.updateById({
      _id: userId,
      data: {
        isBlocked: !user.isBlocked
      }
    })
    return updatedUser
  }

  static updateAdminUser = async ({ _id, data }) => {
    const user = await UserRepo.findById({ _id })
    if (!user) throw new NotFoundErrorResponse('User not found!')
    
    const updateData = {
    ...data,
    password: bcryptjs.hashSync(data.password, 8)
    }

    const updatedUser = await UserRepo.updateById({
      _id: new ObjectId(_id),
      data: updateData
    })
    return updatedUser
  }

  static createAdminAccount = async ({ userData }) => {
    const hashedPassword = bcryptjs.hashSync(userData.password, 8)
    const adminData = {
      ...userData,
      password: hashedPassword
    }

    const newAccount = await UserRepo.createOne({ data: adminData })
    return newAccount
  }
}
export default AdminUserService
