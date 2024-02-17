import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    fullName: { type: Schema.Types.String, required: false },
    status: {
      type: Schema.Types.String,
      default: "active",
      enum: ["active", "inactive", "blocked"],
    },
    email: { type: Schema.Types.String, required: true, unique: true },
    password: { type: Schema.Types.String, required: false },
    socialType: {
      type: Schema.Types.String,
      enum: ["apple", "facebook", "google", ""],
      default: "",
    },
    socialAccessToken: {
      type: Schema.Types.String,
      default: null,
    },
    isVerified: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isDeleted: {
      type: Schema.Types.Boolean,
      default: false,
    },
    deviceInfo: { type: Schema.Types.Array, ref: "Device", required: true },
    // otpInfo: { type: Schema.Types.ObjectId, ref: "Otp" },
    profileInfo: { type: Schema.Types.ObjectId, ref: "Profile" },
    blockedUserList: { type: Schema.Types.Array },
    isOccupied: { type: Schema.Types.Boolean, default: false },
    isProfileCompleted: { type: Schema.Types.Boolean, default: false },
    recommendationLimit: { type: Schema.Types.Number, default: 5 },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
  },
  {
    timestamps: true,
  }
);

const userModel = model("User", userSchema);

export default userModel;
