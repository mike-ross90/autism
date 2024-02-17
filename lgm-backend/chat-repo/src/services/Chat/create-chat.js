import Chat from "../../models/chat-model.js";
import Conversation from "../../models/convo-model.js";
import logger from "../../logger/logger.js";

export const create_chat = async (payload) => {
  try {
    const { senderId, conversation, message, createdAt, isRead, messagesCount } = payload;
    // let convo = await Conversation.findOne({ _id: conversation }).select("isRecieverActive");

    // let isReadValue = false; // Default value for isRead

    // if (convo.isRecieverActive === true) {
    //   isReadValue = true; // If receiver is active, set isRead to true
    // }

    const createdMessage = await Chat.create({
      senderId,
      conversation,
      message,
      isRead, // Assign the determined isRead value
      createdAt,
      messagesCount
    });

    return createdMessage; // Return the created message along with its status
  } catch (err) {
    logger.error(err.message);
    throw err; // Propagate the error if any
  }
};




