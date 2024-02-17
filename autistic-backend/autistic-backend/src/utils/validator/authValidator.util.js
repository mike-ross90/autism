import joi from 'joi'

export const accountVerificationValidator = joi.object({
  userId: joi.string().required(),
  otpKey: joi.string().min(4).max(4).required(),
})

export const loginValidator = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
  deviceType: joi.string().required().valid('android', 'web', 'ios'),
  deviceToken: joi.string().required().allow(''),
})

export const forgotPasswordValidator = joi.object({
  email: joi.string().required(),
})

export const resetPasswordValidator = joi.object({
  otpId: joi.string().required(),
  password: joi.string().required(),
})

export const resendOtpForAccountVerificationValidator = joi.object({
  userId: joi.string().required(),
})

export const resendOtpForOtpVerificationValidator = joi.object({
  userId: joi.string().required(),
})

export const verifyOtpValidator = joi.object({
  userId: joi.string().required(),
  otpKey: joi.string().required(),
})

export const socialRegisterValidator = joi.object({
  socialType: joi.string().required(),
  accessToken: joi.string().required(),
  deviceType: joi.string().required(),
  deviceToken: joi.string().required(),
})

export const registerValidator = joi.object({
  name: joi.string().required(),
  email: joi
    .string()
    .email({ tlds: { allow: false } })
    .required(),
  password: joi.string().required(),
  deviceToken: joi.string().required(),
  deviceType: joi.string().required(),
  userType: joi.string().required(),
  familyName: joi.string().optional(),
})

// export const addProfileValidator = joi.object({
//   fullName: joi.string().required(),
//   contactNo: joi.string().required(),
//   expertise: joi.string().valid('behaviour_therapy', 'art_therapy', 'cognitive_therapy').required(),
//   location: locationRequired,
// })

export const createChildValidator = joi.object({
  // userId: joi.string().required(),
  fullName: joi.string().required(),
  dateOfBirth: joi.date().required(),
  gender: joi.string().valid('male', 'female').required(),
})

export const updateChildValidator = joi.object({
  // userId: joi.string().required(),
  fullName: joi.string().required(),
  dateOfBirth: joi.date().required(),
  gender: joi.string().valid('male', 'female').required(),
})

export const updateParentProfileValidator = joi.object({
  name: joi.string().required(),
  dateOfBirth: joi.date().required(),
  description: joi.string().required(),
  country: joi.string().required(),
  city: joi.string().required(),
  state: joi.string().required(),
  // location: locationRequired,
})

export const createParentProfileValidator = joi.object({
  name: joi.string().required(),
  dateOfBirth: joi.date().required(),
  description: joi.string().required(),
  country: joi.string().required(),
  city: joi.string().required(),
  state: joi.string().required(),
  // location: locationRequired,
})

export const createProfileValidator = joi.object({
  fullName: joi.string().required(),
  contactNo: joi.string().required(),
  dateOfBirth: joi.date().required(),
  description: joi.string().required(),
  country: joi.string().required(),
  city: joi.string().required(),
  state: joi.string().required(),
  expertise: joi.array().items(joi.string()).required(),
})

export const updateExpertProfileValidator = joi.object({
  fullName: joi.string().required(),
  contactNo: joi.string().required(),
  dateOfBirth: joi.date().required(),
  description: joi.string().required(),
  country: joi.string().required(),
  city: joi.string().required(),
  state: joi.string().required(),
  expertise: joi.string().required(),
})

export const createVisualValidator = joi.object({
  day: joi.string().required(),
  time: joi.string().required(),
  action: joi.string().required(),
  description: joi.string().required(),
})
