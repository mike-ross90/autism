import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    likedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: Schema.Types.String },
    body: { type: Schema.Types.String },
    isRead: {type: Schema.Types.Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const notificationModel = model("Notification", notificationSchema);
export default notificationModel;
