import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import logger from "../../logger/logger.js";
import Likes from "../../models/likes-model.js";

export const user_get_matched_conversations = async (req, res, next) => {
  try {
    let get_convos = await Likes.find({
      $or: [{ userId: req.userId }, { likedUserId: req.userId }],
      isMutual: true,
    })
      .populate({
        path: "userId",
        select: "fullName email",
      })
      .populate({
        path: "likedUserId",
        select: "fullName email",
      })
      .select("likedUserId isMutual -_id");

    if (get_convos.length === 0) {
      return next(
        CustomSuccess.createSuccess(get_convos, "No conversations found", 200)
      );
    }

    get_convos = get_convos.map((user) => {
      return user.userId._id.toString() === req.userId.toString()
        ? user.likedUserId
        : user.userId;
    });

    return next(
      CustomSuccess.createSuccess(
        get_convos,
        "Conversations of matched users fetched successfully",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 599));
  }
};
