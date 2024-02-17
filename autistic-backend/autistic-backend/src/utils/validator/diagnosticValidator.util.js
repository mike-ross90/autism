import joi from 'joi'
// import { locationRequired } from './commonValidator.js'

// export const diagnosticFormValidator = joi.object({
//   patientName: joi.string().required(),
//   dateOfBirth: joi.date().required(),
//   age: joi.number().required(),
//   gender: joi.string().required(),
//   // location: locationRequired,
//   country: joi.string().default(''),
//   city: joi.string().default(''),
//   state: joi.string().default(''),
// })

export const diagnosticFormValidator = joi.object({
  profileId: joi.string().required(),
  calendarId: joi.string().required(),
  childId: joi.string().required(),
  patientName: joi.string().required(),
  dateOfBirth: joi.date().required(),
  age: joi.number().required(),
  gender: joi.string().required(),
  // location: locationRequired,
  country: joi.string().default(''),
  city: joi.string().default(''),
  state: joi.string().default(''),
})
