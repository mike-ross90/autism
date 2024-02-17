import joi from "joi";

export const validate_pagination_param = joi.object({
  page: joi.number().min(1).required(),
  limit: joi.number().min(1).required(),
});
