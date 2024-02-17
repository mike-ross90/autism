// import logger from "../../logger/logger.js";
// import Conversation from "../../models/conversation-model.js";
// import Chat from "../../models/chat-model.js";

// export const seen_message_two = async (payload) => {
//   try {
//     const { conversation } = payload;

//     logger.debug("checinig conversationId")
//     logger.debug({conversation})

//     const find_convo = await Conversation.findById(conversation).select("-_id");
//     if (!find_convo) {
//       return {
//         message: "No conversation found",
//         isRecieverActive: false
//       };
//     }
//     return {
//       message: "Seen message successfully",
//       isRecieverActive: false,
//     };
//   } catch (err) {
//     logger.error(err.message);
//   }
// }