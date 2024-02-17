import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import logger from "../../logger/logger.js";
import Notification from "../../models/notification-model.js";
import { Types } from "mongoose";

export const user_get_my_notifications = async (req, res, next) => {
    try {
      const get_my_notifications = await Notification.find({ likedUserId: req.userId })
        .sort({ createdAt: -1 })
        .populate({
          path: "userId",
          populate: {
            path: "profileInfo",
            select: "profile_picture_url -_id",
          },
        })
  
      const formattedNotifications = get_my_notifications.map(notification => {
        const { profileInfo } = notification.userId;
        return {
          profileInfo: {
            fullName: notification.userId.fullName,
            profile_picture_url: profileInfo.profile_picture_url,
            body: notification.body,
            createdAt: notification.createdAt,
            notificationId: notification._id,
            isRead: notification.isRead
            // title: notification.title
          }
        };
      });
  
      if (formattedNotifications.length > 0) {
        return next(
          CustomSuccess.createSuccess(
            formattedNotifications,
            "My notifications fetched successfully",
            200
          )
        );
      }
  
      return next(
        CustomSuccess.createSuccess(
          formattedNotifications,
          "No notifications found",
          200
        )
      );
    } catch (err) {
      logger.error(err.message);
      return next(CustomError.createError(err.message, 500));
    }
};