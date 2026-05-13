import {
  ErrorResponse,
  BadRequestErrorResponse,
  InternalServerErrorResponse
} from '~/core/error.response'

const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (err) {
      if (err?.name === 'MongoServerError' && err?.code === 11000) {
        return next(new BadRequestErrorResponse('Duplicate key error'))
      }

      if (
        err?.name === 'MongooseServerSelectionError' ||
        err?.name === 'MongoNetworkError'
      ) {
        return next(
          new InternalServerErrorResponse(
            'Database connection error',
            undefined,
            err
          )
        )
      }

      if (err instanceof ErrorResponse) {
        return next(err)
      }

      return next(
        new InternalServerErrorResponse('Unexpected error', undefined, err)
      )
    }
  }
}
export default asyncHandler
