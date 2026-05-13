/* eslint-disable no-unused-vars */
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'

export const errorHandlingMiddleware = (err, req, res, next) => {
  const responseError = {
    statusCode: err.status,
    message: err.message || StatusCodes[err.statusCode],
    stack: err.stack
  }

  if (env.BUILD_MODE !== 'dev') delete responseError.stack
  console.log(
    '************************************************************************************************************************************************'
  )
  console.log(err)
  console.log(
    '************************************************************************************************************************************************'
  )

  // Đoạn này có thể mở rộng nhiều về sau như ghi Error Log vào file, bắn thông báo lỗi vào group Slack, Telegram, Email...vv Hoặc có thể viết riêng Code ra một file Middleware khác tùy dự án.

  res.status(responseError.statusCode).json(responseError)
}
