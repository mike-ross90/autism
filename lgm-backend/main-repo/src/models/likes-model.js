import { Schema, model } from "mongoose";

const likeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    likedUserId: { type: Schema.Types.ObjectId, ref: "User" },
    isMutual: { type: Schema.Types.Boolean, default: false },
    isBlocked: { type: Schema.Types.Boolean, default: false },
    isDeleted: { type: Schema.Types.Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const likeModel = model("Likes", likeSchema);

export default likeModel;
