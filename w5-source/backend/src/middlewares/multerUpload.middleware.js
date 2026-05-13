import multer from 'multer'
import {
  BadRequestErrorResponse,
  UnprocessableEntityErrorResponse
} from '~/core/error.response'

const storage = multer.memoryStorage()

const LIMIT_IMAGE_FILE_SIZE = 5 * 1024 * 1024
const LIMIT_COMMON_FILE_SIZE = 30 * 1024 * 1024
const LIMIT_MULTI_FILE_COUNT = 10

const ALLOW_IMAGE_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const imageFileFilter = (req, file, cb) => {
  if (!ALLOW_IMAGE_FILE_TYPES.includes(file.mimetype)) {
    return cb(
      new UnprocessableEntityErrorResponse(
        'File type is invalid. Only accept jpg, jpeg, png, webp.'
      )
    )
  }

  cb(null, true)
}

const commonFileFilter = (req, file, cb) => {
  cb(null, true)
}

const mapMulterError = (err) => {
  if (!(err instanceof multer.MulterError)) return err

  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return new BadRequestErrorResponse('File too large.')

    case 'LIMIT_FILE_COUNT':
      return new BadRequestErrorResponse(
        `Too many files. Maximum is ${LIMIT_MULTI_FILE_COUNT} files.`
      )

    case 'LIMIT_UNEXPECTED_FILE':
      return new BadRequestErrorResponse('Unexpected file field.')

    case 'LIMIT_PART_COUNT':
      return new BadRequestErrorResponse('Too many parts in request.')

    case 'LIMIT_FIELD_KEY':
      return new BadRequestErrorResponse('Field name is too long.')

    case 'LIMIT_FIELD_VALUE':
      return new BadRequestErrorResponse('Field value is too long.')

    case 'LIMIT_FIELD_COUNT':
      return new BadRequestErrorResponse('Too many fields in request.')

    default:
      return new BadRequestErrorResponse(err.message || 'Upload failed.')
  }
}

const wrapMulter =
  (multerInstance, type, fieldName, maxCount = 1) =>
  (req, res, next) => {
    const handler =
      type === 'single'
        ? multerInstance.single(fieldName)
        : multerInstance.array(fieldName, maxCount)

    handler(req, res, (err) => {
      if (!err) return next()

      const normalizedError = mapMulterError(err)
      return next(normalizedError)
    })
  }

const uploadSingleImageMulter = multer({
  storage,
  limits: {
    fileSize: LIMIT_IMAGE_FILE_SIZE,
    files: 1
  },
  fileFilter: imageFileFilter
})

const uploadMultipleFilesMulter = multer({
  storage,
  limits: {
    fileSize: LIMIT_COMMON_FILE_SIZE,
    files: LIMIT_MULTI_FILE_COUNT
  },
  fileFilter: commonFileFilter
})

export const multerUploadMiddleware = {
  uploadSingleImage: wrapMulter(uploadSingleImageMulter, 'single', 'file'),
  uploadMultipleFiles: wrapMulter(
    uploadMultipleFilesMulter,
    'array',
    'files',
    LIMIT_MULTI_FILE_COUNT
  )
}
