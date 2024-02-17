import User from "../../models/user-model.js";
import Device from "../../models/device-model.js";
import Profile from "../../models/profile-model.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import logger from "../../logger/logger.js";
// import { validate_account_exists } from "../../utils/verify-account-exists/validate-account-exists.js";
import { validate_user_verification } from "../../utils/validate-user-verification.js";
import { validate_social_user_login } from "../../utils/validators/user-validator.js";
import { generate_token } from "../../utils/generate-token.js";
import { startSession } from "mongoose";

export const user_social_login = async (req, res, next) => {
  const session = startSession();
  try {
    (await session).startTransaction();

    const { body } = req;
    await validate_social_user_login.validateAsync(body);

    let user = await User.findOne({ email: body.email });
    let profile;

    if(user){
        profile = await Profile.findOne({
            userId: user._id,
        })
    }
    else{
        user = await User.create({ 
          email: body.email,
          fullName: body.fullName,
          socialType: body.socialType,
          isVerified: true})
        }

    if (!(await validate_user_verification({ userId: user._id }))) {
      return next(CustomError.createError("User is not verified", 400));
    }

    const register_device = await new Device({
      deviceToken: body.deviceToken,
      userId: user._id,
    }).save(session);

    const updated_user = await User.findByIdAndUpdate(
      user._id,
      {
        $push: { deviceInfo: register_device._id },
        location: {
          type: "Point",
          coordinates: [body.longitude, body.latitude],
        },
      },
      { new: true },
      {
        session,
      }
    )
      .populate({
        path: "profileInfo",
        select: "profile_picture_url -_id",
      })
      .select("-password -deviceInfo");

    (await session).commitTransaction();

    const token = generate_token({
      id: user._id,
      email: user.email,
      username: user.username,
    });

    return next(
      CustomSuccess.createSuccess(
        {
          user: updated_user,
          token: token,
        },
        "User logged in successfully",
        200
      )
    );
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    if (err.code == "11000")
      return next(
        CustomError.createError(
          "a user already logged in with this device",
          400
        )
      );
    return next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};
