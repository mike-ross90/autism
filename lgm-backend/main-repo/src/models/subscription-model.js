import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
  subscriptionType: {
    type: Schema.Types.String,
    enum: ["free-tier", "tier-1", "tier-2", "tier-3"],
    default: "free-tier",
  },
  expiry: { type: Schema.Types.Date },
  isDeleted: { type: Schema.Types.Boolean, default: false },
  createdAt: { type: Schema.Types.Date },
  updatedAt: { type: Schema.Types.Date },
});

const subscriptionModel = model("Subscription", subscriptionSchema);
export default subscriptionModel;
