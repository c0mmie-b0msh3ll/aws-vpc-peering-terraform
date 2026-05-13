import JWT from 'jsonwebtoken'

/**
 * function tại mới một token - cần 2 tham số đầu vào
 * userInfo : những thông tin muốn đính kèm vào token
 * secretSignature : chữ kí bí mật (dạng 1 chuỗi string) là private key
 * tokenLife : thời gian sống của Token
 */

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife
    })
  } catch (error) {
    throw error
  }
}

/**
 * function kiếm tra 1 token có hợp lệ hay không
 * hợp lệ ở đây là cái token được tạo ra có đúng với cữ ký bí mật secretSignature trong dự án hay không
 */

const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw error
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
