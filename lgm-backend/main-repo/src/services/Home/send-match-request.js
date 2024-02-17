import CustomSuccess from "../../utils/custom-response/custom-success.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import logger from "../../logger/logger.js";
import Likes from "../../models/likes-model.js";
import Dislikes from "../../models/dislikes-model.js";
import Profile from "../../models/profile-model.js";
import User from "../../models/user-model.js";
import Notification from "../../models/notification-model.js"
import { startSession } from "mongoose";
import { validate_send_match_request } from "../../utils/validators/match-request-validator.js";
import { send_notification_for_message } from "../../utils/send-notification.js"

export const send_match_request = async (req, res, next) => {
  const session = startSession();
  try {
    (await session).startTransaction();

    const { body } = req; //body will be containing liked user's username

    await validate_send_match_request.validateAsync(body);

    const liked_user = await Profile.findOne({
      username: body.username,
    }).select("userId");

    if (!liked_user) {
      return next(
        CustomError.createError("requested profile doesnot exist", 400)
      );
    }
    if (liked_user.userId.toString() === req.userId.toString()) {
      return next(
        CustomError.createError("Cannot send match request to yourself", 400)
      );
    }

    const get_dislikes = await Dislikes.findOne({
      userId: req.userId,
      dislikedUserId: liked_user.userId,
    });

    if (get_dislikes) {
      return next(
        CustomError.createError("Cannot like an already disliked user", 400)
      );
    }

    const check_cross_like = await Likes.findOne({
      //userA => userB then userB => userA (not alloweds)
      userId: liked_user.userId,
      likedUserId: req.userId,
    });
    if (check_cross_like) {
      return next(CustomSuccess.createSuccess("", "Match request sent", 200));
    }

    const already_liked = await Likes.findOne({
      userId: req.userId,
      likedUserId: liked_user.userId,
    });

    if (!already_liked) {
      const liked = await new Likes({
        userId: req.userId,
        likedUserId: liked_user.userId,
      })
      .save(session);

      await Likes.findOne({_id: liked._id})

      await User.findByIdAndUpdate(
        req.userId,
        {
          $inc: { recommendationLimit: -1 },
        },
        { new: true },
        { session }
      );

      const senderUser = await User.findById(liked_user.userId).populate({
        path: 'deviceInfo',
        options: { sort: { createdAt: -1 } },
      });

      if (!senderUser) {
        return next(CustomError.createError("User not found", 404));
      }

      const latestDevice = senderUser.deviceInfo[0];
      if (!latestDevice) {
        return next(CustomError.createError("Device information not found", 404));
      }

      const notificationData = {
        userId: req.userId,
        likedUserId: liked_user.userId,
        title: "New Match Request",
        body: "You've got a new admirer! Someone liked your profile on LGM (Let's Get Married). Take the next step to connect and potentially find your life partner",
      };

      send_notification_for_message({
        token: latestDevice.deviceToken,
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData,
      });

      const notification = new Notification(notificationData);
      notification.save();


      (await session).commitTransaction();
      return next(
        CustomSuccess.createSuccess(liked, "Match request sent", 200)
      );
    }
    return next(CustomError.createError("Match request already sent", 400));
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};
