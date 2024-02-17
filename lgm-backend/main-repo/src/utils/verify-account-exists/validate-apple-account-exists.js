import User from "../../models/user-model.js";
import logger from "../../logger/logger.js";

export const validate_apple_account_exists = async (payload) => {
  try {
    const { email } = payload

    const find_user = await User.findOne({
      email: email,
    });

    if (find_user) {
      if (find_user.socialType === "apple") {
        return false;
      }
      return true;
    }
    return true; 
  } catch (err) {
    logger.error(err.message);
    return false;
  }
};
