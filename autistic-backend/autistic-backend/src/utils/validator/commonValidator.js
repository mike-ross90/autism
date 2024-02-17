import joi from 'joi'

export const locationRequired = {
  lat: joi.number().min(-90).max(90).required(),
  long: joi.number().min(-180).max(180).required(),
}

export const deviceRequired = {
  deviceType: joi.string().required().valid('android', 'web', 'ios'),
  deviceToken: joi.string().required(),
}

export const AuthMiddlewareValidator = joi.object({
  authToken: joi.string().required(),
  refreshToken: joi.string().required(),
})

export const AdminMiddlewareValidator = joi.object({
  adminToken: joi.string().required(),
  adminRefreshToken: joi.string().required(),
})

export const PaginationValidator = joi.object({
  page: joi.number().min(1).required(),
})
