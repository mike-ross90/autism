import joi from 'joi'

export const reviewValidator = joi.object({
  rating: joi.number().required(),
  comment: joi.string().required(),
})
