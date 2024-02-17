import logger from "../../logger/logger.js";
import Conversation from "../../models/conversation-model.js";
import Subscription from "../../models/subscription-model.js";
import Chat from "../../models/chat-model.js";

export const get_conversation = async (payload) => {
  try {
    const { sender, reciever  } = payload;

    console.log(payload, "payload");

    // console.log(lastMessage, "last message message last");

    const find_convo = await Conversation.findOne({
      $or: [
        { $and: [{ sender: sender }, { reciever: reciever }] },

        { $and: [{ sender: reciever }, { reciever: sender }] },
      ],
    }).select("isEnded");

    if (!find_convo) {
      return {
        message: "No conversation found",
        conversation: null,
        messageDetails: null,
        isEnded: null,
      };
    }

    // let messages = await Chat.find({
    //   conversation: find_convo._id,
    // }).select("message isRead senderId createdAt");


 // Assuming you have a Chat model and find_convo._id defined

let messages = await Chat.find({ conversation: find_convo._id })
.select("message isRead senderId createdAt conversation")
// .populate({
//   path: "conversation",
//   select: "-_id isRecieverActive"
// })

let last_msg = messages[messages.length - 1];

logger.debug("----------------data from last_msg : ");
logger.debug({ last_msg });

logger.debug("----------------Room Size : ");
// logger.debug(io.sockets.adapter.rooms.get(find_convo._id).size);
// if (io.sockets.adapter.rooms.get(find_convo._id).size) {
//   if(!find_convo.isActive1 && !find_convo.isActive2){
//   logger.debug("----------------isActive1:true ");
//   await Conversation.findOneAndUpdate({_id:find_convo._id},{isActive1:true},)
// }
// else if(!find_convo.isActive1 && find_convo.isActive2){
//   logger.debug("----------------isActive1:true ");
//   await Conversation.findOneAndUpdate({_id:find_convo._id},{isActive1:true},)
// }
// else if(find_convo.isActive1 && !find_convo.isActive2){
//   logger.debug("----------------isActive2:true ");
//   await Conversation.findOneAndUpdate({_id:find_convo._id},{isActive2:true},)
// }
// if(find_convo.isActive1){
//   await Conversation.findOneAndUpdate({_id:find_convo._id},{isActive2:true},)
// }

// if (find_convo.isActive1 && find_convo.isActive2) {
//   await Conversation.findOneAndUpdate({_id:find_convo._id},{isRecieverActive:true},)
//   console.log("here")
  
//   await Chat.updateMany(
//     {
//       conversation: find_convo._id,
//       isRead: false 
//     },
//     { $set: { isRead: true } }
//     );
//     console.log("here2")
// }
if (sender.toString() !== last_msg.senderId.toString() ) {
  // await Conversation.findOneAndUpdate({_id:find_convo._id},{isRecieverActive:true},)
  console.log("here")
  
   await Chat.updateMany(
    {
      conversation: find_convo._id,
      isRead: false 
    },
    { $set: { isRead: true } }
    );
    console.log("here2")
    messages = await Chat.find({ conversation: find_convo._id })
    .select("message isRead senderId createdAt conversation")
    console.log("here3")
}

    // messages.map(async(msg) => {
    //   if(sender.toString() !== msg.senderId && !msg.isRead){
    //     await Chat.findOneAndUpdate({_id: msg._id}, {isRead: true})        
    //   }
    // })

    const check_subscription = await Subscription.findOne({
      conversation: find_convo._id,
    }).select("expiry");

    if (new Date() > check_subscription.expiry) {
      return {
        message: "Subscription expired",
        conversation: find_convo._id.toString(),
        messageDetails: messages,
        isEnded: find_convo.isEnded,
      };
    }

    return {
      message: "Conversation and messages fetched successfully",
      conversation: find_convo._id.toString(),
      messageDetails: messages,
      isEnded: find_convo.isEnded,
    };

    // const create_convo = await Conversation.create({
    //   sender,
    //   reciever,
    //   lastMessage,
    // });
    // // console.log(create_convo);
    // return {
    //   conversation: create_convo._id.toString(),
    //   messageDetails: [],
    // };
  } catch (err) {
    logger.error(err.message);
  }
};
