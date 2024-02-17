import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reciever: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
      type: Schema.Types.String,
      default: "",
    },
    isEnded: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isRecieverActive: {
      type: Schema.Types.Boolean,
      default: false,      
    }
  },
  {
    timestamps: true,
  }
);

const conversationModel = model("Conversation", conversationSchema);
export default conversationModel;
