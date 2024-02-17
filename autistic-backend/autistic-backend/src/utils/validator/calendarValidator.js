import joi from 'joi'

export const calendarValidator = joi.object({
  day: joi.string().required(),
  startTime: joi.string().required(),
  endTime: joi.string().required(),
  status: joi.boolean().required(),
})
