import joi from "joi";

export const validate_make_payment = joi.object({
  paymentIntent: joi.string().required(),
  tierToUpdate: joi.string().valid("tier-1", "tier-2", "tier-3").required(),
  paymentTime: joi.date().required(),
});
