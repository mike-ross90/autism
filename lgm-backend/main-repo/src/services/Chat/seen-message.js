import logger from "../../logger/logger.js";
import Conversation from "../../models/conversation-model.js";
import Chat from "../../models/chat-model.js";

export const seen_message = async (payload,size) => {
  try {
    const { conversation } = payload;
    console.log("sizesizesizesizesizesize")
    console.log(size)

    logger.debug("checinig conversationId")
    logger.debug({conversation})

    if(size>1){
      return {
        message: "Seen message successfully",
        isRecieverActive: true,
      }
    }else{
      return {
        message: "Seen message successfully",
        isRecieverActive: false,
      }
    }

    const find_convo = await Conversation.findById(conversation).select("-_id isRecieverActive");
    if (!find_convo) {
      return {
        message: "No conversation found",
        isRecieverActive: false
      };
    }
    return {
      message: "Seen message successfully",
      isRecieverActive: find_convo.isRecieverActive,
    };
  } catch (err) {
    logger.error(err.message);
  }
}