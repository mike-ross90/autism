import Feedback from "../../models/help-and-feedback-model.js";
import logger from "../../logger/logger.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import { validate_pagination_param } from "../../utils/validators/pagination-param-validator.js";

export const admin_list_all_feedbacks = async (req, res, next) => {
  try {
    const { limit, page } = req.query;

    await validate_pagination_param.validateAsync({ limit, page });

    const total_feedback_count = await Feedback.countDocuments();
    const total_pages = Math.ceil(total_feedback_count / limit);
    const skip = (page - 1) * limit;

    const all_feedbacks = await Feedback.find()
      .populate({
        path: "userId",
        select: "fullName -_id",
      })
      .select("userId subject message images")
      .skip(skip)
      .limit(limit);

    if (all_feedbacks.length === 0) {
      return next(
        CustomSuccess.createSuccess(all_feedbacks, "No feedbacks found", 200)
      );
    }

    return next(
      CustomSuccess.createSuccess(
        {
          feedbacks: all_feedbacks,
          totalPages: total_pages,
          currentPage: parseInt(page),
          totalItems: total_feedback_count,
        },
        "All feedbacks fetched successfully",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
