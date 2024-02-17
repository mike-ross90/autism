import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import logger from "../../logger/logger.js";
import Likes from "../../models/likes-model.js";
import { Types } from "mongoose";

export const user_get_others_likes = async (req, res, next) => {
  try {
    //logged in user id will be fetched from middleware
    //likes will be displayed whether the user is matched or not, just the user shouldn't be blocked

    const get_others_likes = await Likes.aggregate([
      {
        $match: {
          likedUserId: new Types.ObjectId(req.userId.toString()),
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
        $lookup: {
          from: "profiles",
          localField: "userId",
          foreignField: "userId",
          as: "profile_liked_by",
        },
      },
      {
        $unwind: "$profile_liked_by",
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          profile_liked_by: {
            fullName: "$user.fullName",
            likedUserId: "$likedUserId",
            username: "$profile_liked_by.username",
          },
        },
      },
    ]).project({
      "profile_liked_by.fullName": 1,
      "profile_liked_by.country": 1,
      "profile_liked_by.about": 1,
      "profile_liked_by.age": 1,
      "profile_liked_by.likedUserId": 1,
      "profile_liked_by.username": 1,
    });

    if (get_others_likes.length > 0) {
      return next(
        CustomSuccess.createSuccess(
          get_others_likes,
          "Other user's likes fetched successfully",
          200
        )
      );
    }
    return next(
      CustomSuccess.createSuccess(
        get_others_likes,
        "No other user's likes found",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
