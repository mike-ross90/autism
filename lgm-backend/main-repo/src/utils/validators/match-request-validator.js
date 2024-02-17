import joi from "joi";

export const validate_send_match_request = joi.object({
  username: joi.string().required(),
});

export const validate_process_match_request = joi.object({
  action: joi.string(),
  userId: joi.string(),
  messageTime: joi.date().when("action", {
    is: "accept",
    then: joi.date().required(),
    otherwise: joi.forbidden(),
  }),
});
