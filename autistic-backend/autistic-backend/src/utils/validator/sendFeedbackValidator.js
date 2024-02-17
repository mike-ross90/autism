import joi from 'joi'

export const sendFeedbackValidator = joi.object({
  name: joi.string().required(),
  subject: joi.string().required(),
  email: joi.string().required(),
  message: joi.string().required(),
})
