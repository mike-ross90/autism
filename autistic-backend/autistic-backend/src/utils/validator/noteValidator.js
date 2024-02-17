import joi from 'joi'

export const notesValidator = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
})
