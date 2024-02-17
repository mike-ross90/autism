import config from "../config/config.js";
import CustomError from "../utils/custom-response/custom-error.js";

export const check_user_bearer = (req, res, next) => {
  const bearer_token = config.BEARER_TOKEN;
  const token_header = req.headers["auth_token"];

  if (token_header == bearer_token) {
    next();
  } else {
    return next(CustomError.createError("Unauthorised request", 401));
  }
};
