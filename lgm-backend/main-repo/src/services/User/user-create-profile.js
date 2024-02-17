import User from "../../models/user-model.js";
import Profile from "../../models/profile-model.js";
import logger from "../../logger/logger.js";
import { validate_user_profile } from "../../utils/validators/user-validator.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import { validate_account_exists } from "../../utils/verify-account-exists/validate-account-exists.js";
import { validate_user_verification } from "../../utils/validate-user-verification.js";
import { startSession } from "mongoose";

export const user_create_profile = async (req, res, next) => {
  const session = startSession();
  try {
    //userId retrieved from middleware (req.userId)
    (await session).startTransaction();

    const { body } = req;

    await validate_user_profile.validateAsync(body);

    if (!(await validate_account_exists(req))) {
      return next(CustomError.createError("User doesnot exist", 400));
    }

    if (!(await validate_user_verification(req))) {
      return next(CustomError.createError("User is not verified", 400));
    }

    if (!req.file) {
      return next(CustomError.createError("Profile image is required", 400));
    }

    const image_path = req?.file?.key?.split("/")[2];

    const find_profile = await Profile.findOne({ userId: req.userId });
    if (find_profile) {
      return next(
        CustomError.createError("Profile already exists for this user", 400)
      );
    }

    const profile = await new Profile({
      userId: req.userId,
      username: body.username,
      gender: body.gender,
      dateOfBirth: {
        dateMonth: body.dateMonth,
        dateDay: body.dateDay,
        dateYear: body.dateYear,
      },
      country: body.country,
      about: body.about,
      phone: body.phone,
      profile_picture_url: image_path,
      age: calculate_age(body.dateMonth, body.dateDay, body.dateYear),
    }).save(session);

    await User.findByIdAndUpdate(
      req.userId,
      {
        profileInfo: profile._id,
        isProfileCompleted: true,
      },
      { new: true },
      { session }
    );

    (await session).commitTransaction();

    return next(
      CustomSuccess.createSuccess(
        profile,
        "User profile created successfully",
        201
      )
    );
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    return err.code === 11000 && "phone" in err.keyValue
      ? next(CustomError.createError("phone number already exists", 500))
      : err.code === 11000 && "username" in err.keyValue
      ? next(CustomError.createError("username already exists", 500))
      : next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};

const calculate_age = (month, day, year) => {
  var currentDate = new Date();
  var birthDate = new Date(year, month - 1, day);
  var age = currentDate.getFullYear() - birthDate.getFullYear();
  if (
    currentDate.getMonth() < birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};
