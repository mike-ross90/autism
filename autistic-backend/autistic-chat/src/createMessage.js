import ChatRoomModel from "../../autistic-backend/src/models/chatRoom.model.js";
import ChatMessageModel from "./models/chatMessage.model.js";
// import { redis } from "./redisConnection.js";
export const createMessage = async (payload) => {
  try {
    const { sender, roomId, content } = payload;
    console.log("payload", payload);

    const newMessage = await ChatMessageModel.create({
      sender,
      roomId,
      content,
      status: "sent",
    });

    await ChatRoomModel.updateOne(
      { _id: roomId },
      { $set: { lastMessage: newMessage._id } }
    );

    // await redis.set(`lastMessage:${roomId}`, newMessage._id);
  } catch (error) {
    console.log("error creating chat", error);
  }
};
