import logger from "../../logger/logger.js";
import Likes from "../../models/likes-model.js";
import Conversation from "../../models/conversation-model.js";
import Chat from "../../models/chat-model.js";
import Subscription from "../../models/subscription-model.js";

export const get_matched_conversations = async (payload) => {
  try {
    const { user, currentTime } = payload;
    
    // const get_convo = await Conversation.findOne({
    //   $or: [{ sender: user }, { reciever: user }],
    //   isEnded: false,
    // }).select("_id");
    const get_convo = await Conversation.findOne({
      $or: [{ sender: user }, { reciever: user }],
      isEnded: false,
    })

    console.log("get_convo")
    console.log(get_convo)

    if (!get_convo) {
      return {
        message: "No ongoing conversations found",
      };
    }

    let get_matched_users = await Likes.find({
      $or: [{ userId: user }, { likedUserId: user }],
      isMutual: true,
      isDeleted: false,
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

    const chat_sub = await Subscription.findOne({
      conversation: get_convo._id,
    }).select("subscriptionType expiry userId");

    const get_messages = await Chat.findOne({ conversation: get_convo._id })
      .select("message createdAt")
      .sort({
        createdAt: -1,
      });  

    const updated_msg = await Conversation.findByIdAndUpdate(
      get_convo._id,
      {
        lastMessage: get_messages.message,
      },
      {
        new: true,
      }
    ).select("lastMessage");
    // console.log("get_convo.isActive1 && get_convo.isActive2")
    // console.log(get_convo.isActive1 && get_convo.isActive2)
  //   if(get_convo.isActive1 && get_convo.isActive2){
  // console.log("===========>>>>>>>>>>>>>>1")
//   const conversationId = await Conversation.findOneAndUpdate(
//     { _id: get_convo._id },
//     { isActive1: false },
//     );
//   }
//   else if(get_convo.isActive1 && !get_convo.isActive2){
//   console.log("===========>>>>>>>>>>>>>>2")
//   const conversationId = await Conversation.findOneAndUpdate(
//     { _id: get_convo._id },
//     { isActive1: false },
//     );
//   }
//   else if(!get_convo.isActive1 && get_convo.isActive2){
//   console.log("===========>>>>>>>>>>>>>>3")
//   const conversationId = await Conversation.findOneAndUpdate(
//     { _id: get_convo._id },
//     { isActive2: false },
//     );
// }


    // if(!get_convo.isActive1 && !get_convo.isActive2 ){
    const conversationId = await Conversation.findOneAndUpdate(
      { _id: get_convo._id },
      { isReceiverActive: false },
      );
    // }
      // const conversationId2 = await Conversation.findOneAndUpdate(
      //   { 
      //     _id: get_convo._id,
      //     isReceiverActive: true
      //   },
      //   { 
      //     $set: { isReceiverActive2: true }
      //   }
      // );
    const get_unread_msgs = await Chat.find(
      {
        conversation: conversationId._id,
        isRead: false
      }
    ).sort({ createdAt: -1 }).limit(1); 

    const lastUnreadMessage = get_unread_msgs.length > 0 ? get_unread_msgs[0] : null;
    
    get_matched_users = get_matched_users.map((u) => {
      return u.userId._id.toString() === user.toString()
        ? {
            ...u.likedUserId._doc,
            subType: chat_sub.subscriptionType,
            subExpiry: chat_sub.expiry,
            isExpired: new Date(currentTime) > chat_sub.expiry ? true : false,
            lastMessage: updated_msg.lastMessage,
            createdAt: get_messages.createdAt,
            createdBy: chat_sub.userId,
            conversation: conversationId._id,
          }
        : {
            ...u.userId._doc,
            subType: chat_sub.subscriptionType,
            subExpiry: chat_sub.expiry,
            isExpired: new Date(currentTime) > chat_sub.expiry ? true : false,
            lastMessage: updated_msg.lastMessage,
            createdAt: get_messages.createdAt,
            createdBy: chat_sub.userId,
            conversation: conversationId._id,
          };
    });

    return {
      message: "Conversations fetched successfully",
      threadDetails: get_matched_users,
      lastMessageDetails: lastUnreadMessage
    };
  } catch (err) {
    logger.error(err.message);
  }
};
