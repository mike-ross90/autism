import { Schema, model } from "mongoose";

const deviceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    deviceToken: { type: Schema.Types.String, default: "" },
    // deviceType: {
    //   type: Schema.Types.String,
    //   enum: ["apple", "facebook", "google", ""],
    //   default: "",
    // },
  },
  {
    timestamps: true,
  }
);

const deviceModel = model("Device", deviceSchema);
export default deviceModel;
