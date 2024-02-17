import User from "../../models/user-model.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import logger from "../../logger/logger.js";
import { validate_account_exists } from "../../utils/verify-account-exists/validate-account-exists.js";
import { validate_forgot_password } from "../../utils/validators/user-validator.js";
import { generate_and_save_otp } from "../../utils/otp-service.js";
import { forgot_password_template } from "../../utils/email-template.js";
import { send_email } from "../../utils/email-service.js";

export const user_forgot_password = async (req, res, next) => {
  try {
    const { body } = req;
    await validate_forgot_password.validateAsync(body);

    if (!(await validate_account_exists(body))) {
      return next(CustomError.createError("User doesnot exist", 400));
    }
    const user = await User.findOne({ email: body.email });
    if (user) {
      const otp_key = await generate_and_save_otp(user._id);
      const email_data = forgot_password_template(user.fullName, otp_key);
      await send_email(user.email, email_data.subject, email_data.html);

      return next(
        CustomSuccess.createSuccess(
          { userId: user._id },
          "Otp sent to registered email",
          200
        )
      );
    }
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
