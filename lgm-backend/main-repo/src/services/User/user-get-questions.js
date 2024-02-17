import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import OnlyQuestions from "../../models/only-questions.js";
import Preferences from "../../models/preferences-model.js";
import logger from "../../logger/logger.js";
import { Types } from "mongoose";
import { validate_user_questions } from "../../utils/validators/user-validator.js";

export const user_get_questions = async (req, res, next) => {
  try {
    // const { body } = req;
    // await validate_user_questions.validateAsync(body);
    let questions = await OnlyQuestions.find().select("question type");

    return next(CustomSuccess.createSuccess(questions, "All Questions ", 200));
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
