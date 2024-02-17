import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import OnlyQuestions from "../../models/only-questions.js";
import { validate_user_questions } from "../../utils/validators/user-validator.js";
import logger from "../../logger/logger.js";

export const create_questions = async (req, res, next) => {
  try {
    const { body } = req;

    await validate_user_questions.validateAsync(body);

    let questions = await new OnlyQuestions({
      question: body.question,
      type: body.type,
    }).save();

    return next(
      CustomSuccess.createSuccess(questions, "Question Created", 200)
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
