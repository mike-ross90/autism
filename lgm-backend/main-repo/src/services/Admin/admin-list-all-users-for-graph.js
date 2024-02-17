import User from "../../models/user-model.js";
import logger from "../../logger/logger.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";

export const admin_list_all_users_for_graph = async (req, res, next) => {
  try {
    const all_users = await User.find()
      .populate({
        path: "profileInfo",
        select: "gender -_id",
      })
      .select("fullName email status");
    if (all_users.length === 0) {
      return next(
        CustomSuccess.createSuccess(all_users, "No users found", 200)
      );
    }

    return next(
      CustomSuccess.createSuccess(
        all_users,
        "All users fetched successfully",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
