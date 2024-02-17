import { Schema, model } from "mongoose";

const helpAndFeedbackSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    subject: { type: Schema.Types.String, required: true },
    message: { type: Schema.Types.String, required: true },
    images: { type: Schema.Types.Array },
  },
  {
    timestamps: true,
  }
);

const helpAndFeedbackModel = model("Feedback", helpAndFeedbackSchema);

export default helpAndFeedbackModel;
