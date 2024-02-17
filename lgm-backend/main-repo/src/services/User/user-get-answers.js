import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import questionAnswer from "../../models/question-answer-model.js";
import Preferences from "../../models/preferences-model.js";
import logger from "../../logger/logger.js";
import { Types } from "mongoose";
import { validate_user_questions } from "../../utils/validators/user-validator.js";

export const user_get_answers = async (req, res, next) => {
  try {
    let answers = await questionAnswer.find({ userId: req.userId });

    if (!answers || answers.length === 0) {
      return next(CustomError.createError("User answers not found", 404));
    }

    return next(CustomSuccess.createSuccess(answers, "User Answers", 200));
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
