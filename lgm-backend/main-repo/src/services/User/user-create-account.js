import User from "../../models/user-model.js";
import Device from "../../models/device-model.js";
// import Subscription from "../../models/subscription-model.js";
import logger from "../../logger/logger.js";
import config from "../../config/config.js";
import { validate_create_account } from "../../utils/validators/user-validator.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import { validate_account_exists } from "../../utils/verify-account-exists/validate-account-exists.js";
import { validate_google_account_exists } from "../../utils/verify-account-exists/validate-google-account-exists.js";
import { validate_apple_account_exists } from "../../utils/verify-account-exists/validate-apple-account-exists.js";
import { generate_and_save_otp } from "../../utils/otp-service.js";
import { account_verification } from "../../utils/email-template.js";
import { send_email } from "../../utils/email-service.js";
import { startSession } from "mongoose";
import { hash } from "bcrypt";

export const user_create_account = async (req, res, next) => {
  const session = startSession();
  try {
    (await session).startTransaction();

    const { body } = req;

    await validate_create_account.validateAsync(body);

    const user_google_exist = await validate_google_account_exists(body);
    if (user_google_exist === false) {
      return next(CustomError.createError("User already registered via Google, please login", 400));
    }

    const user_apple_exist = await validate_apple_account_exists(body);
    if (user_apple_exist === false) {
      return next(CustomError.createError("User already registered via Apple, please login", 400));
    }

    if (await validate_account_exists(body)) {
      return next(CustomError.createError("Email already exist", 400));
    }

    // const subscription_expiry = new Date();
    // subscription_expiry.setDate(subscription_expiry.getDate() + 7);
    // subscription_expiry.setHours(23, 59, 59, 999);

    const hashed_password = await hash(
      body.password,
      parseInt(config.PW_SALT_VAL)
    );

    const deviceInfo = await new Device({
      deviceToken: body.deviceToken,
    }).save(session);

    const create_user = await new User({
      fullName: body.fullName,
      email: body.email,
      password: hashed_password,
      deviceInfo: deviceInfo._id,
      socialType: body.socialType,
      socialAccessToken: body.socialAccessToken,
      location: {
        type: "Point",
        coordinates: [body.longitude, body.latitude],
      },
    }).save(session);

    await Device.findByIdAndUpdate(
      deviceInfo._id,
      {
        userId: create_user._id,
      },
      { new: true },
      { session }
    );

    // await new Subscription({
    //   userId: create_user._id,
    //   expiry: subscription_expiry,
    // }).save(session);

    (await session).commitTransaction();

    if (create_user) {
      const otp_key = await generate_and_save_otp(create_user._id);
      const email_data = account_verification(create_user.fullName, otp_key);
      await send_email(create_user.email, email_data.subject, email_data.html);

      return next(
        CustomSuccess.createSuccess(
          {
            user: create_user,
          },
          "User account created successfully",
          201
        )
      );
    }
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};
