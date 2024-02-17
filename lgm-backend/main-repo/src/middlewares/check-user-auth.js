import jwt from "jsonwebtoken";
import config from "../config/config.js";
import CustomError from "../utils/custom-response/custom-error.js";

export const check_user_auth = (req, res, next) => {
  const token_header = req.headers["authorization"];

  if (!token_header) {
    return next(CustomError.createError("Unauthorised request", 401));
  }
  const token = token_header.split(" ")[1];
  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(CustomError.createError("User session expired", 401));
    }
    req.userId = decoded.id;
    req.email = decoded.email;
    next();
  });
};
