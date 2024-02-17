import { Schema, model } from "mongoose";

const chatSchema = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: Schema.Types.String,
    default: "",
  },
  isRead: {
    type: Schema.Types.Boolean,
  },
  createdAt: {
    type: Schema.Types.Date,
  },
  messagesCount: {
    type: Schema.Types.String,    
  }
});

const chatModel = model("Chat", chatSchema);

export default chatModel;
