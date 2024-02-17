import logger from "../../logger/logger.js";
import Chat from "../../models/chat-model.js";
import Conversation from "../../models/conversation-model.js";

export const update_last_message = async (payload) => {
  try {
    const { conversation } = payload;

    const get_messages = await Chat.findOne({ conversation })
      .sort({
        createdAt: -1,
      })
      .select("message createdAt");

    const updated_msg = await Conversation.findByIdAndUpdate(
      conversation,
      {
        lastMessage: get_messages.message,
      },
      {
        new: true,
      }
    );
    return {
      lastMessage: updated_msg.lastMessage,
      createdAt: get_messages.createdAt,
    };
  } catch (err) {
    logger.error(err.message);
  }
};
