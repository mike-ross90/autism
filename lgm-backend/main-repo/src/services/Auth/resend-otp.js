import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import User from "../../models/user-model.js";
import logger from "../../logger/logger.js";
import { generate_and_save_otp } from "../../utils/otp-service.js";
import { account_resend_verification } from "../../utils/email-template.js";
import { send_email } from "../../utils/email-service.js";
import { validate_account_exists } from "../../utils/verify-account-exists/validate-account-exists.js";
import { validate_resend_otp } from "../../utils/validators/otp-key-validator.js";

export const resend_otp = async (req, res, next) => {
  //body will contain userId
  //after calling this api once, there will be a timer on frontend which will let user call resend otp after some time
  try {
    const { body } = req;

    await validate_resend_otp.validateAsync(body);
    if (!(await validate_account_exists(body))) {
      return next(CustomError.createError("User doesnot exist", 400));
    }
    const user = await User.findById(body.userId);
    const otp_key = await generate_and_save_otp(body.userId);
    const email_data = account_resend_verification(user.fullName, otp_key);
    await send_email(user.email, email_data.subject, email_data.html);

    return next(
      CustomSuccess.createSuccess(
        { userId: user._id },
        "Otp resent successfully",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
