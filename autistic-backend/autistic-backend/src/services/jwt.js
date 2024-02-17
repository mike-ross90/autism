import dotenv from 'dotenv'
import * as jose from 'jose'
import keyGen from './keyGen.js'

const envConfig = dotenv.config({ path: './.env' }).parsed

const endPoint = envConfig ? envConfig.ENDPOINT : 'localhost'
const { publicKey, privateKey } = keyGen
console.log('keyGen: ', keyGen)

// use jose to generate token in standard way
export const generateToken = async (data) => {
  const { _id, tokenType, deviceId, isTemporary, userType } = data
  console.log('req.body generateToken: ', data)
  if (!_id || !deviceId) {
    return {
      error: {
        message: 'Invalid arguments to generate token',
      },
    }
  }
  return await new jose.EncryptJWT({
    uid: _id,
    ref: _id,
    deviceId: deviceId || '',
    userType,
    tokenType: tokenType || 'auth',
    isTemporary: isTemporary || false,
  })
    .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
    .setIssuedAt(new Date().getTime())
    .setIssuer(endPoint)
    .setAudience(endPoint)
    .setExpirationTime(
      tokenType === 'refresh' && !isTemporary ? '30d' : !isTemporary ? '2d' : '60m',
    )
    .encrypt(publicKey)
}

export const joseJwtDecrypt = async (token, PK = privateKey) => {
  try {
    const decryptedToken = await jose.jwtDecrypt(token, PK)
    return decryptedToken
  } catch (error) {
    console.log(error)
    return { error }
  }
}

export const verifyAuthJWT = async (data) => {
  const { authToken, refreshToken } = data
  let decodedAuthToken, decodedRefreshToken, decode

  try {
    decodedAuthToken = await joseJwtDecrypt(authToken)
    if (decodedAuthToken.error) {
      if (decodedAuthToken.error.message !== 'JWT expired') {
        return {
          error: 'Invalid authorization token.',
        }
      }
      decodedRefreshToken = await joseJwtDecrypt(refreshToken)
      if (decodedRefreshToken.error) {
        if (decodedRefreshToken.error.message !== 'JWT expired') {
          return {
            error: 'Invalid refresh token.',
          }
        }
        throw new Error('No valid Tokens were provided')
      }

      decode = { ...decodedRefreshToken }
    } else {
      decode = { ...decodedAuthToken }
    }
    console.log({ decode })
    return decode.payload
  } catch (error) {
    console.log(error)
    return {
      error: error.message,
    }
  }
}
