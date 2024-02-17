import logger from "../../logger/logger.js";
import Likes from "../../models/likes-model.js";
import Conversation from "../../models/conversation-model.js";
import Chat from "../../models/chat-model.js";
import Subscription from "../../models/subscription-model.js";

export const get_chat_history = async (payload) => {
  try {
    const { user } = payload;

    const get_convo = await Conversation.find({
      $or: [{ sender: user }, { reciever: user }],
      isEnded: true,
    }).select("_id lastMessage");

    if (get_convo.length === 0) {
      return {
        message: "No ended conversations found",
      };
    }

    let get_matched_users = await Likes.find({
      $or: [{ userId: user }, { likedUserId: user }],
      isDeleted: true,
      isMutual: true,
    })
      .populate({
        path: "userId",
        select: "fullName email",
        populate: {
          path: "profileInfo",
          select: "profile_picture_url -_id",
        },
      })
      .populate({
        path: "likedUserId",
        select: "fullName email",
        populate: {
          path: "profileInfo",
          select: "profile_picture_url -_id",
        },
      })
      .select("likedUserId isMutual -_id");

    if (get_matched_users.length === 0) {
      return {
        message: "No matched conversations found",
      };
    }

    const convo_ids = get_convo.map((i) => {
      return i._id;
    });
    const chat_sub = await Subscription.find({
      conversation: { $in: convo_ids },
    }).select("subscriptionType expiry userId");

    // const get_messages = await Chat.find({
    //   conversation: { $in: convo_ids },
    // })
    //   .select("createdAt")
    //   .sort({
    //     createdAt: -1,
    //   });

    get_matched_users = await Promise.all(
      get_matched_users.map(async (u, index) => {
        const get_latest_message = await Chat.findOne({
          conversation: convo_ids[index],
        })
          .select("createdAt")
          .sort({ createdAt: -1 })
          .limit(1);

        if (u.userId._id.toString() === user.toString()) {
          return {
            ...u.likedUserId._doc,
            subType: chat_sub[index].subscriptionType,
            subExpiry: chat_sub[index].expiry,
            isExpired: new Date() > chat_sub[index].expiry ? true : false,
            lastMessage: get_convo[index].lastMessage,
            createdAt: get_latest_message.createdAt,
            createdBy: chat_sub[index].userId,
          };
        } else {
          return {
            ...u.userId._doc,
            subType: chat_sub[index].subscriptionType,
            subExpiry: chat_sub[index].expiry,
            isExpired: new Date() > chat_sub[index].expiry ? true : false,
            lastMessage: get_convo[index].lastMessage,
            createdAt: get_latest_message.createdAt,
            createdBy: chat_sub[index].userId,
          };
        }
      })
    );

    return {
      message: "Ended Conversations fetched successfully",
      threadDetails: get_matched_users,
    };
  } catch (err) {
    logger.error(err.message);
  }
};
