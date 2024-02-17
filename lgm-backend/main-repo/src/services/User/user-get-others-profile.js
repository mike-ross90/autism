import Profile from "../../models/profile-model.js";
import logger from "../../logger/logger.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import { validate_other_user_profile } from "../../utils/validators/user-validator.js";

export const user_get_others_profile = async (req, res, next) => {
  try {
    const { userId } = req.query;

    await validate_other_user_profile.validateAsync(req.query);

    const get_profile = await Profile.findOne({ userId })
      .select("-_id -userId -__v -createdAt -updatedAt")
      .populate({
        path: "preferencesInfo",
        select: "interests images -_id",
      });

    if (!get_profile) {
      return next(
        CustomError.createError("requested profile does not exist", 400)
      );
    }

    return next(
      CustomSuccess.createSuccess(
        get_profile,
        "Profile fetched successfully",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return err && err.kind === "ObjectId"
      ? next(CustomError.createError("Invalid user id", 500))
      : next(CustomError.createError(err.message, 500));
  }
};
