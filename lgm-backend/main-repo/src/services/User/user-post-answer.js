import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import questionAnswer from "../../models/question-answer-model.js";
import Preferences from "../../models/preferences-model.js";
import logger from "../../logger/logger.js";
import { Types } from "mongoose";
import { validate_user_questions } from "../../utils/validators/user-validator.js";

// export const user_post_answer = async (req, res, next) => {
//   try {
//     const { body } = req;

//     const QuesAns = await questionAnswer.insertMany(body);

//     return next(CustomSuccess.createSuccess(QuesAns, "answer Posted ", 200));
//   } catch (err) {
//     logger.error(err.message);
//     return next(CustomError.createError(err.message, 500));
//   }
// };

export const user_post_answer = async (req, res, next) => {
  try {
    const { body, userId } = req;

    // Ensure userId is included in the request body
    if (!userId) {
      throw new Error("userId is required.");
    }

    // Add userId to each question-answer pair in the request body
    const QuesAnsWithUserId = body.map((item) => ({ ...item, userId }));

    // Insert question-answer pairs with userId
    const QuesAns = await questionAnswer.insertMany(QuesAnsWithUserId);

    return next(
      CustomSuccess.createSuccess(QuesAns, "Answers posted successfully.", 200)
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
