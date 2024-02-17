import Admin from "../../models/admin-model.js";
import Device from "../../models/device-model.js";
import logger from "../../logger/logger.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import { generate_admin_token } from "../../utils/generate-admin-token.js";
import { validate_admin_login } from "../../utils/validators/admin-validator.js";
import { validate_admin_account_exists } from "../../utils/verify-account-exists/validate-admin-account-exists.js";
import { compare } from "bcrypt";
import { startSession } from "mongoose";

export const admin_login = async (req, res, next) => {
  const session = startSession();
  try {
    (await session).startTransaction();

    const { body } = req;

    await validate_admin_login.validateAsync(body);

    if (!(await validate_admin_account_exists(body))) {
      return next(
        CustomError.createError("Your Email or Password is incorrect", 400)
      );
    }

    let admin_user = await Admin.findOne({ email: body.email });

    if (!(await compare(body.password, admin_user.password))) {
      return next(
        CustomError.createError("Your Email or Password is incorrect", 400)
      );
    }

    const register_device = await new Device({
      deviceToken: body.deviceToken,
      userId: admin_user._id,
    }).save(session);

    admin_user = await Admin.findByIdAndUpdate(
      admin_user._id,
      {
        $push: { deviceInfo: register_device._id },
      },
      { new: true },
      {
        session,
      }
    ).select("-password -createdAt -updatedAt -deviceInfo");

    (await session).commitTransaction();

    const token = generate_admin_token({
      id: admin_user._id,
      email: admin_user.email,
    });

    return next(
      CustomSuccess.createSuccess(
        {
          user: admin_user,
          token: token,
        },
        "Admin logged in successfully",
        200
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
