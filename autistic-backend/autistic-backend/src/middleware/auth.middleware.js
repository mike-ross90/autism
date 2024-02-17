import { verifyAuthJWT } from '../services/jwt.js'
import { checkMongooseId } from '../services/mongooseResource.js'
import { AuthMiddlewareValidator } from '../utils/validator/commonValidator.js'

export const authMiddleware = async (req, res, next) => {
  const authToken = req.headers.authtoken
  const refreshToken = req.headers.refreshtoken
  const { error } = AuthMiddlewareValidator.validate({
    authToken,
    refreshToken,
  })
  if (error) {
    return res.status(401).json({
      status: false,
      message: error.message,
    })
  }
  const verify = await verifyAuthJWT({
    authToken,
    refreshToken,
  })
  if (verify.error) {
    console.log('verify => ', verify)
    return res.status(401).send({
      status: false,
      message: verify.error.message,
    })
  }
  console.log({ verify }, 'verify')
  if (!checkMongooseId(verify.uid)) {
    return res.status(401).json({ message: 'Invalid decrypt token found', status: false })
  }
  if (verify.uid) {
    req.userId = verify.uid
    req.deviceId = verify.deviceId
    req.userType = verify.userType
    req.tokenType = verify.tokenType
    req.isTemporary = verify.isTemporary
  } else {
    return res.status(401).json({
      status: false,
      message: 'Unexpected authorization token provided',
    })
  }

  return next()
}
