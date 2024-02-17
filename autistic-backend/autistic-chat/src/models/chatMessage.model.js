import mongoose, { Schema } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
    },
    content: {
      type: Schema.Types.String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    // isRead: {
    //   type: Schema.Types.Boolean,
    //   enum: [true, false],
    // },
  },
  {
    timestamps: true,
  }
);

const ChatMessageModel = mongoose.model("ChatMessage", ChatMessageSchema);
export default ChatMessageModel;
