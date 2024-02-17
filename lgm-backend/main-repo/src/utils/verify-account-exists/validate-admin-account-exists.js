import Admin from "../../models/admin-model.js";
import logger from "../../logger/logger.js";

export const validate_admin_account_exists = async (payload) => {
  try {
    const { email, userId } = payload;

    const find_user = await Admin.findOne({
      $or: [{ _id: userId }, { email: email }],
    });

    if (find_user) return true;
    return false;
  } catch (err) {
    logger.error(err.message);
  }
};
