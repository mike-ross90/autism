import Feedback from "../../models/help-and-feedback-model.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import logger from "../../logger/logger.js";
import { validate_feedback } from "../../utils/validators/user-validator.js";

export const user_create_feedback = async (req, res, next) => {
  try {
    const { body } = req;

    await validate_feedback.validateAsync(body);

    let images = [];

    if ("images" in req.files) {
      images = req?.files?.images?.map((file) => file.key.split("/")[2]);
    }

    const create_feedback = await Feedback.create({
      userId: req.userId,
      images,
      ...body,
    });

    return next(
      CustomSuccess.createSuccess(
        create_feedback,
        "Feedback created successfully",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
