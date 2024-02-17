import CustomSuccess from "../../utils/custom-response/custom-success.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import logger from "../../logger/logger.js";
import Likes from "../../models/likes-model.js";
import Conversation from "../../models/conversation-model.js";
import Chat from "../../models/chat-model.js";
import User from "../../models/user-model.js";
import Notification from "../../models/notification-model.js";
import Subscription from "../../models/subscription-model.js";
import { Types } from "mongoose";
import { send_notification_for_message } from "../../utils/send-notification.js";
import { validate_process_match_request } from "../../utils/validators/match-request-validator.js";
import { startSession } from "mongoose";

export const process_match_request = async (req, res, next) => {
  const session = startSession();
  try {
    (await session).startTransaction();

    const { body } = req; //will be containing one of three actions (accept request, delete req, block user) and request's userid

    await validate_process_match_request.validateAsync(body);

    const liked_user = await User.findById(body.userId);

    if (!liked_user) {
      return next(CustomError.createError("Liked user does not exist", 400));
    }

    if (body.action === "accept") {
      const subscription_expiry = new Date(body.messageTime);
      //needs to be changed after testing
      // subscription_expiry.setDate(subscription_expiry.getDate() + 7);
      // subscription_expiry.setHours(23, 59, 59, 999);
      subscription_expiry.setMilliseconds(
        subscription_expiry.getMilliseconds() + 300000
      );

      await Likes.updateOne(
        {
          userId: body.userId,
          likedUserId: req.userId,
        },
        {
          isMutual: true,
        },
        session
      );
      await User.updateMany(
        { _id: [body.userId, req.userId] },
        {
          isOccupied: true,
        },
        session
      );

      const create_convo = await new Conversation({
        sender: body.userId,
        reciever: req.userId,
        lastMessage: "This is the beginning of conversation",
      }).save(session);

      await new Chat({
        conversation: create_convo._id,
        senderId: body.userId,
        message: "This is the beginning of conversation",
        createdAt: body.messageTime,
      }).save(session);

      await new Subscription({
        userId: body.userId,
        conversation: create_convo._id,
        expiry: subscription_expiry,
        createdAt: body.messageTime,
        updatedAt: body.messageTime,
      }).save(session);

      const senderUser = await User.findById(body.userId).populate({
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
        likedUserId: body.userId,
        title: "Match Request Accepted",
        body: "Great news! Your connection request has been accepted on LGM (Let's Get Married). Start your journey of deep connection and discovery with a potential life partner",
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
      return next(CustomSuccess.createSuccess("", "request accepted", 200));
    }

    if (body.action == "delete") {
      await Likes.deleteOne(
        {
          userId: body.userId,
          likedUserId: req.userId,
        },
        {
          isMutual: true,
        },
        session
      );
      (await session).commitTransaction();
      return next(CustomSuccess.createSuccess("", "request deleted", 200));
    }
    if (body.action == "block") {
      await Likes.updateOne(
        {
          userId: body.userId,
          likedUserId: req.userId,
        },
        {
          isBlocked: true,
        },
        session
      );

      await User.updateOne(
        { _id: req.userId, blockedUserList: { $ne: body.userId } },
        {
          $addToSet: {
            blockedUserList: new Types.ObjectId(body.userId),
          },
        },
        session
      );
      (await session).commitTransaction();
      return next(CustomSuccess.createSuccess("", "request blocked", 200));
    }
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};
