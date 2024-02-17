import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import logger from "../../logger/logger.js";
import Likes from "../../models/likes-model.js";
import { Types } from "mongoose";

export const user_get_my_likes = async (req, res, next) => {
  try {
    //logged in user id will be fetched from middleware
    //likes will be displayed whether the user is matched or not, just the user shouldn't be blocked

    const get_likes = await Likes.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(req.userId.toString()),
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "likedUserId",
          foreignField: "userId",
          as: "liked_profile",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$liked_profile",
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          liked_profile: {
            fullName: "$user.fullName",
            likedUserId: "$likedUserId",
            username: "$liked_profile.username",
          },
        },
      },
    ]).project({
      "liked_profile.fullName": 1,
      "liked_profile.country": 1,
      "liked_profile.about": 1,
      "liked_profile.age": 1,
      "liked_profile.likedUserId": 1,
      "liked_profile.username": 1,
    });

    if (get_likes.length > 0) {
      return next(
        CustomSuccess.createSuccess(
          get_likes,
          "My likes fetched successfully",
          200
        )
      );
    }
    return next(CustomSuccess.createSuccess(get_likes, "No likes found", 200));
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
