import { model, Schema } from "mongoose";

const adminSchema = new Schema(
  {
    username: { type: Schema.Types.String, required: true, unique: true },
    email: { type: Schema.Types.String, required: true, unique: true },
    password: { type: Schema.Types.String, required: true },
    deviceInfo: { type: Schema.Types.Array, ref: "Device", required: true },
  },
  {
    timestamps: true,
  }
);

const adminModel = model("Admin", adminSchema);

export default adminModel;
