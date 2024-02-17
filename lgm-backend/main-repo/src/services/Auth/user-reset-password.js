import User from "../../models/user-model.js";
import Device from "../../models/device-model.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import logger from "../../logger/logger.js";
import { validate_account_exists } from "../../utils/verify-account-exists/validate-account-exists.js";
import { validate_reset_password } from "../../utils/validators/user-validator.js";
import { hash } from "bcrypt";
import config from "../../config/config.js";
export const user_reset_password = async (req, res, next) => {
  try {
    //body will be containing the new password
    // user info will be decoded from the token
    const { body } = req;
    await validate_reset_password.validateAsync(body);

    if (!(await validate_account_exists(req))) {
      return next(CustomError.createError("User doesnot exist", 400));
    }
    const new_hashed_password = await hash(
      body.password,
      parseInt(config.PW_SALT_VAL)
    );
    const user = await User.findByIdAndUpdate(req.userId, {
      password: new_hashed_password,
    });

    if (user) {
      return next(
        CustomSuccess.createSuccess("", "Password reset successfully", 200)
      );
    }
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
