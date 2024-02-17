import Admin from "../../models/admin-model.js";
import Device from "../../models/device-model.js";
import logger from "../../logger/logger.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import { validate_admin_logout } from "../../utils/validators/admin-validator.js";
import { validate_admin_account_exists } from "../../utils/verify-account-exists/validate-admin-account-exists.js";
import { startSession } from "mongoose";

export const admin_logout = async (req, res, next) => {
  const session = startSession();
  try {
    (await session).startTransaction();

    const { body } = req;

    await validate_admin_logout.validateAsync(body);

    if (!(await validate_admin_account_exists(req))) {
      return next(
        CustomError.createError("Your Email or Password is incorrect", 400)
      );
    }

    const device = await Device.findOne({
      userId: req.userId,
      deviceToken: body.deviceToken,
    });

    if (!device) {
      return next(CustomError.createError("User session expired", 400));
    }

    const user = await Admin.findByIdAndUpdate(
      req.userId,
      {
        $pull: { deviceInfo: device._id },
      },

      { new: true },
      {
        session,
      }
    );
    await Device.findOneAndRemove(
      { _id: device._id, userId: req.userId },
      session
    );

    (await session).commitTransaction();

    return next(
      CustomSuccess.createSuccess("", "admin logged out successfully", 200)
    );
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};
