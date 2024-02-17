import logger from "../../logger/logger.js";
import Preferences from "../../models/preferences-model.js";
import Profile from "../../models/profile-model.js";
import { validate_create_preferences } from "../../utils/validators/user-validator.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import { validate_account_exists } from "../../utils/verify-account-exists/validate-account-exists.js";
import { startSession } from "mongoose";

export const user_create_preferences = async (req, res, next) => {
  const session = startSession();
  try {
    //userId retrieved from middleware (req.userId)
    // console.log(req);
    (await session).startTransaction();

    const { body } = req;

    await validate_create_preferences.validateAsync(body);

    if (!(await validate_account_exists(req))) {
      return next(CustomError.createError("User doesnot exist", 400));
    }

    const images = req?.files?.map((file) => file.key.split("/")[2]);

    if (images.length === 0) {
      return next(
        CustomError.createError("At least one images is required", 400)
      );
    }

    const existing_preferences = await Preferences.findOne({
      userId: req.userId,
    });
    if (existing_preferences) {
      return next(
        CustomError.createError("Preferences already exist for this user", 400)
      );
    }
    const preferences = await new Preferences({
      userId: req.userId,
      likes: body.likes,
      interests: body.interests,
      hobbies: body.hobbies,
      images: images,
    }).save(session);

    await Profile.findOneAndUpdate(
      { userId: req.userId },
      {
        preferencesInfo: preferences._id,
      },
      { new: true },
      { session }
    );

    (await session).commitTransaction();

    return next(
      CustomSuccess.createSuccess(
        preferences,
        "User profile created successfully",
        201
      )
    );
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};
