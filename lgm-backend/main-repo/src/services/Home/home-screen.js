import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import logger from "../../logger/logger.js";
import Preferences from "../../models/preferences-model.js";
import { Types } from "mongoose";
import User from "../../models/user-model.js";

export const home_screen = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
      .select("isOccupied recommendationLimit")
      .populate("profileInfo"); //condition for the logged in user

    if (user.isOccupied) {
      return next(
        CustomSuccess.createSuccess(
          "",
          "you are already matched with a user",
          200
        )
      );
    }
    const user_preferences = await Preferences.findOne({
      userId: req.userId,
    }).select("likes interests hobbies");
    const other_user_pref = await Preferences.aggregate([
      {
        $match: {
          userId: {
            $ne: new Types.ObjectId(req.userId.toString()),
          },
          $or: [
            { likes: { $in: user_preferences.likes } },
            { interests: { $in: user_preferences.interests } },
            { hobbies: { $in: user_preferences.hobbies } },
          ],
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
        $match: {
          "user.isOccupied": false,
        },
      },
      {
        $lookup: {
          from: "dislikes",
          localField: "userId",
          foreignField: "dislikedUserId",
          as: "disliked_user",
        },
      },
      {
        $match: {
          disliked_user: { $size: 0 },
        },
      },
      {
        $lookup: {
          from: "likes",
          let: { likedUser: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$likedUserId", "$$likedUser"] },
                    { $eq: ["$isBlocked", true] },
                  ],
                },
              },
            },
          ],
          as: "blocked_likes",
        },
      },
      {
        $match: {
          blocked_likes: { $size: 0 },
        },
      },
      {
        $addFields: {
          matchedPreferences: {
            $sum: [
              {
                $size: { $setIntersection: ["$likes", user_preferences.likes] },
              },
              {
                $size: {
                  $setIntersection: ["$interests", user_preferences.interests],
                },
              },
              {
                $size: {
                  $setIntersection: ["$hobbies", user_preferences.hobbies],
                },
              },
            ],
          },
        },
      },
      { $sort: { matchedPreferences: -1 } },
      {
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "preferencesInfo",
          as: "recommended_profile",
        },
      },
      {
        $match: {
          "recommended_profile.gender":
            user.profileInfo.gender === "Male" ? "Female" : "Male",
        },
      },

      { $unwind: "$recommended_profile" },
      {
        $lookup: {
          from: "likes",
          let: { otherUserId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$userId",
                        new Types.ObjectId(req.userId.toString()),
                      ],
                    },
                    { $eq: ["$likedUserId", "$$otherUserId"] },
                  ],
                },
              },
            },
          ],
          as: "sent_likes",
        },
      },
      {
        $match: {
          sent_likes: { $size: 0 },
        },
      },

      {
        $lookup: {
          from: "dislikes",
          let: { otherUserId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$userId",
                        new Types.ObjectId(req.userId.toString()),
                      ],
                    },
                    { $eq: ["$dislikeUserId", "$$otherUserId"] },
                  ],
                },
              },
            },
          ],
          as: "sent_likes",
        },
      },
      {
        $match: {
          sent_likes: { $size: 0 },
        },
      },

      {
        $project: {
          likes: 1,
          interests: 1,
          hobbies: 1,
          userId: 1,
          matchedPreferences: 1,
          recommended_profile: 1,
        },
      },
      { $sample: { size: user.recommendationLimit } },
    ]);

    if (other_user_pref.length > 0) {
      return next(
        CustomSuccess.createSuccess(
          other_user_pref,
          "home screen fetched successfully",
          200
        )
      );
    }
    return next(
      CustomSuccess.createSuccess(
        other_user_pref,
        "No recommendations at the moment",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
