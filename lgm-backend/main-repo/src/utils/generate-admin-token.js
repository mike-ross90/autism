import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const generate_admin_token = (payload) => {
  const { email, id } = payload;

  const token = jwt.sign(
    {
      email: email,
      id: id,
    },
    config.JWT_ADMIN_SECRET,
    {
      expiresIn: config.EXPIRES_IN,
    }
  );
  return token;
};
