import { Schema, model } from "mongoose";

const preferenceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    likes: [{ type: Schema.Types.String }],
    interests: [{ type: Schema.Types.String }],
    hobbies: [{ type: Schema.Types.String }],
    images: [{ type: Schema.Types.String }],
  },
  {
    timestamps: true,
  }
);
const preferenceModel = model("Preferences", preferenceSchema);
export default preferenceModel;
