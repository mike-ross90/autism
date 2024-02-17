import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import logger from "../../logger/logger.js";
import Likes from "../../models/likes-model.js";
import User from "../../models/user-model.js";
export const get_match_request = async (req, res, next) => {
  try {
    const checkOccupied = await User.findById(req.userId).select("isOccupied");
    if (checkOccupied.isOccupied) {
      return next(
        CustomSuccess.createSuccess(
          "",
          "you are already matched with a user",
          200
        )
      );
    }

    const requests = await Likes.find({
      likedUserId: req.userId,
      isBlocked: false,
      isMutual: false,
    }).populate({
      path: "userId",
      select: "fullName profileInfo -_id",
      populate: {
        path: "profileInfo",
        select: "profile_picture_url -_id userId country about",
      },
    });

    if (requests.length > 0) {
      return next(
        CustomSuccess.createSuccess(
          requests,
          "match requests fetched successfully",
          200
        )
      );
    }
    return next(
      CustomSuccess.createSuccess(requests, "no match requests found", 200)
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
