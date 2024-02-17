import joi from "joi";

export const validate_admin_login = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
  deviceToken: joi.string().required(),
});

export const validate_admin_logout = joi.object({
  deviceToken: joi.string().required(),
});

export const validate_conversation_status = joi.object({
  status: joi.string().valid("active", "ended").required(),
});

export const validate_reply_to_feedback = joi.object({
  feedbackId: joi.string().required(),
  subject: joi.string().required(),
  message: joi.string().required(),
});
