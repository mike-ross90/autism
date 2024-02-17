import joi from "joi";

export const validate_otp_key = joi.object({
  userId: joi.string().required(),
  otpKey: joi.string().length(4).required(),
});

export const validate_resend_otp = joi.object({
  userId: joi.string().required(),
});
