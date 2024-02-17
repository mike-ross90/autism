import CustomSuccess from "../../utils/custom-response/custom-success.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import logger from "../../logger/logger.js";
import Dislikes from "../../models/dislikes-model.js";
import Likes from "../../models/likes-model.js";
import User from "../../models/user-model.js";
import Profile from "../../models/profile-model.js";
import { startSession } from "mongoose";

export const dislike_user_profile = async (req, res, next) => {
  const session = startSession();
  try {
    //body will be containing disliked user's username
    (await session).startTransaction();

    const { body } = req;

    const disliked_user = await Profile.findOne({
      username: body.username,
    }).select("userId");

    if (!disliked_user) {
      return next(
        CustomError.createError("requested profile doesnot exist", 400)
      );
    }
    if (disliked_user.userId.toString() === req.userId.toString()) {
      return next(
        CustomError.createError("Cannot send dislike request to yourself", 400)
      );
    }

    const get_likes = await Likes.findOne({
      userId: req.userId,
      likedUserId: disliked_user.userId,
    });

    if (get_likes) {
      return next(
        CustomError.createError("Cannot dislike an already liked user", 400)
      );
    }

    const already_disliked = await Dislikes.findOne({
      userId: req.userId,
      dislikedUserId: disliked_user.userId,
    });
    if (!already_disliked) {
      const dislike = await new Dislikes({
        userId: req.userId,
        dislikedUserId: disliked_user.userId,
      }).save(session);

      await User.findByIdAndUpdate(
        req.userId,
        {
          $inc: { recommendationLimit: -1 },
        },
        { new: true },
        { session }
      );
      (await session).commitTransaction();

      return next(
        CustomSuccess.createSuccess(
          dislike,
          "Profile disliked successfully",
          200
        )
      );
    }

    return next(CustomError.createError("User already disliked", 400));
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};
