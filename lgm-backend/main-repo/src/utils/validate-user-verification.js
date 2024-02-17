import User from "../models/user-model.js";
import logger from "../logger/logger.js";
export const validate_user_verification = async (payload) => {
  try {
    const { userId } = payload;

    const user = await User.findById(userId).select("isVerified");
    if (!user.isVerified) return false;
    return true;
  } catch (err) {
    logger.error(err.message);
  }
};
