// import logger from "../../logger/logger.js";
// import Conversation from "../../models/conversation-model.js";
// import Chat from "../../models/chat-model.js";

// export const chat_seen_message = async (payload) => {
//   try {
//     const { isRead, userId } = payload;

//     logger.debug("checking payload")
//     logger.debug({ payload })

//     const check_msg = await 

//     if (!find_convo) {
//       return {
//         message: "No conversation found",
//       };
//     }
//     return {
//       message: "Seen message successfully",
//       isRead: find_convo.isRecieverActive
//     };
//   } catch (err) {
//     logger.error(err.message);
//   }
// }