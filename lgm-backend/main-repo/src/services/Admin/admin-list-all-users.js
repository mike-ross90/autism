import User from "../../models/user-model.js";
import logger from "../../logger/logger.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import { validate_pagination_param } from "../../utils/validators/pagination-param-validator.js";

export const admin_list_all_users = async (req, res, next) => {
  try {
    // const { limit, page } = req.query;

    // await validate_pagination_param.validateAsync({ limit, page });

    // const total_user_count = await User.countDocuments();
    // const total_pages = Math.ceil(total_user_count / limit);
    // const skip = (page - 1) * limit;

    const all_users = await User.find()
      .populate({
        path: "profileInfo",
        select: "gender -_id",
      })
      .select("fullName email status")
      // .skip(skip)
      // .limit(limit);

    if (all_users.length === 0) {
      return next(
        CustomSuccess.createSuccess(all_users, "No users found", 200)
      );
    }

    return next(
      CustomSuccess.createSuccess(
        {
          users: all_users,
          // totalPages: total_pages,
          // currentPage: parseInt(page),
          // totalItems: total_user_count,
        },
        "All users fetched successfully",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
