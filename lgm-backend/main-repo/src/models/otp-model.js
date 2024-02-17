import { Schema, model } from "mongoose";

const otpSchema = new Schema({
  otpKey: { type: Schema.Types.String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  expiry: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const otpModel = model("Otp", otpSchema);
export default otpModel;
