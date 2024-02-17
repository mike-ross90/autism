import Feedback from "../../models/help-and-feedback-model.js";
import User from "../../models/user-model.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import logger from "../../logger/logger.js";
import { validate_reply_to_feedback } from "../../utils/validators/admin-validator.js";
import { send_reply_email_from_admin } from "../../utils/email-service.js";

export const admin_reply_to_feedback = async (req, res, next) => {
  try {
    const { body } = req;

    await validate_reply_to_feedback.validateAsync(body);

    const feedback = await Feedback.findById(body.feedbackId).select("userId");

    if (!feedback) {
      return next(CustomError.createError("Feedback not found", 400));
    }

    const user = await User.findById(feedback.userId).select("email");

    if (!user) {
      return next(CustomError.createError("User not found", 400));
    }

    await send_reply_email_from_admin(
      user.email,
      req.email,
      body.subject,
      body.message
    );

    return next(
      CustomSuccess.createSuccess("", "Reply successfully sent", 200)
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
