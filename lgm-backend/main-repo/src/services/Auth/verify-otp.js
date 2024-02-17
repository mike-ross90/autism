import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import Otp from "../../models/otp-model.js";
import User from "../../models/user-model.js";
import logger from "../../logger/logger.js";
import { verify_otp_expiry } from "../../utils/otp-service.js";
import { validate_otp_key } from "../../utils/validators/otp-key-validator.js";
import { validate_account_exists } from "../../utils/verify-account-exists/validate-account-exists.js";
import { generate_token } from "../../utils/generate-token.js";

export const verify_otp_key = async (req, res, next) => {
  try {
    // body will contain userId and otp key
    const { body } = req;
    await validate_otp_key.validateAsync(body);

    if (!(await validate_account_exists(body))) {
      return next(CustomError.createError("invalid user", 400));
    }

    const get_otp = await Otp.findOne({ userId: body.userId }).select("otpKey");

    if (get_otp.otpKey !== body.otpKey) {
      return next(CustomError.createError("invalid otp", 400));
    }
    if (!(await verify_otp_expiry(body.userId))) {
      return next(CustomError.createError("otp key has expired", 400));
    }
    const user = await User.findByIdAndUpdate(
      body.userId,
      {
        isVerified: true,
      },
      { new: true }
    );

    const token = generate_token({
      id: user._id,
      email: user.email,
    });
    return next(
      CustomSuccess.createSuccess(
        { token: token },
        "Otp verified successfully",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
