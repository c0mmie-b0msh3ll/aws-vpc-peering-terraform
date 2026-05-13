import { mongoClientInstance } from '~/config/mongodb'
import { NotFoundErrorResponse } from '~/core/error.response'
import S3Provider from '~/providers/S3Provider'
import BackgroundRepo from '~/repo/adminBackground.repo'

class AdminBackgroundService {
  static createBackground = async ({ backgroundData }) => {
    const session = await mongoClientInstance.startSession()
    try {
      session.startTransaction()

      const uploaded = await S3Provider.upload(backgroundData.file)

      const newBackground = {
        entity: backgroundData.entity,
        title: backgroundData.title,
        image: S3Provider.getUrl(uploaded.fileKey),
        status: backgroundData.status,
        isDelete: false
      }

      const createdFile = await BackgroundRepo.createOne({
        data: newBackground,
        session
      })

      await session.commitTransaction()

      return createdFile
    } catch (error) {
      await session.abortTransaction()
      throw error
    }
  }

  static updateBackground = async ({ _id, data }) => {
    const session = await mongoClientInstance.startSession()

    try {
      session.startTransaction()

      const background = await BackgroundRepo.findById({ _id, session })
      if (!background) throw new NotFoundErrorResponse('Background Not Found')

      let image = background.image

      const isNewFile = data.file && typeof data.file !== 'string'

      if (isNewFile) {
        const uploaded = await S3Provider.upload(data.file)
        const newImageUrl = S3Provider.getUrl(uploaded.fileKey)

        if (background.image) {
          try {
            await S3Provider.deleteByUrl(background.image)
          } catch (error) {
            console.error('Delete old image failed:', error)
          }
        }

        image = newImageUrl
      } else if (typeof data.file === 'string' && data.file.trim() !== '') {
        image = data.file
      }

      const updateBackground = {
        entity: data.entity,
        title: data.title,
        image,
        status: data.status
      }

      const updated = await BackgroundRepo.updateById({
        _id,
        data: updateBackground,
        session
      })

      await session.commitTransaction()
      return updated
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  static deleteBlockBackground = async ({ _id }) => {
    try {
      const background = await BackgroundRepo.findById({ _id: _id })

      if (!background) throw new NotFoundErrorResponse('Background Not Found')

      return await BackgroundRepo.updateById({
        _id: background._id,
        data: { isDelete: true }
      })
    } catch (error) {
      console.log(error)
    }
  }

  static fetchBackgrounds = async ({ data }) => {
    const keyword = data?.search?.trim() || ''
    const page = Number(data?.page || 1)
    const limit = Number(data?.limit || 8)
    const skip = (page - 1) * limit

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const filter = {
      isDelete: false
    }

    if (keyword) {
      filter.$or = [
        { title: { $regex: escapedKeyword, $options: 'i' } },
        { entity: { $regex: escapedKeyword, $options: 'i' } }
      ]
    }

    const [backgrounds, totalCount] = await Promise.all([
      BackgroundRepo.findManyWithPagination({
        filter,
        skip,
        limit
      }),
      BackgroundRepo.countDocuments({ filter })
    ])

    return {
      backgrounds,
      totalCount,
      page,
      limit
    }
  }

  static updateBlockBackground = async ({ backgroundId }) => {
    const background = await BackgroundRepo.findById({ _id: backgroundId })

    if (!background) {
      throw new Error('Background not found')
    }

    const updatedBackground = await BackgroundRepo.updateById({
      _id: backgroundId,
      data: {
        status: background.status === 'active' ? 'inactive' : 'active'
      }
    })

    return updatedBackground
  }
}
export default AdminBackgroundService
