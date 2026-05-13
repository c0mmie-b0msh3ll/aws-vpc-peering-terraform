import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import {
  GoneErrorResponse,
  UnAuthorizedErrorResponse
} from '~/core/error.response'

const isAuthorized = async (req, res, next) => {
  const clientAccessToken = req.cookies.accessToken
  if (!clientAccessToken)
    throw new UnAuthorizedErrorResponse('Unauthorized! (Token not found)')

  try {
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    req.userContext = accessTokenDecoded
    next()
  } catch (error) {
    if (error?.message?.includes('jwt expired'))
      throw new GoneErrorResponse('Need to refresh your token!')

    throw new UnAuthorizedErrorResponse('Unauthorized! (Invalid token)')
  }
}

export const authMiddleware = {
  isAuthorized
}
