import { Schema, model } from "mongoose";

const dislikeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  dislikedUserId: { type: Schema.Types.ObjectId, ref: "User" },
  expiry: {
    type: Date,
    default: () => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return today;
    },
    expires: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const dislikeModel = model("Dislikes", dislikeSchema);

export default dislikeModel;
