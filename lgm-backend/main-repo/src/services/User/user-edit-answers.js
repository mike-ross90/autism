import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import questionAnswer from "../../models/question-answer-model.js";
import Preferences from "../../models/preferences-model.js";
import logger from "../../logger/logger.js";
import { Types } from "mongoose";
import { validate_user_edit_answer } from "../../utils/validators/user-validator.js";

// export const user_edit_answers = async (req, res, next) => {
//   try {
//     await validate_user_edit_answer.validateAsync(req.body);
//     let answers = await questionAnswer.findOneAndUpdate(
//       { _id: req.body.id },
//       { answer: req.body.answer },
//       { new: true }
//     );

//     return next(CustomSuccess.createSuccess(answers, "Answer Updated", 200));
//   } catch (err) {
//     logger.error(err.message);
//     return next(CustomError.createError(err.message, 500));
//   }
// };
export const user_edit_answers = async (req, res, next) => {
  try {
    const questions = req.body;
    // await validate_user_edit_answer.validateAsync(req.body);
    for (const question of questions) {
      const { id, answer } = question;
      await questionAnswer.updateOne({ _id: id }, { $set: { answer: answer } });
    }

    return next(CustomSuccess.createSuccess({}, "Answer Updated", 200));
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
