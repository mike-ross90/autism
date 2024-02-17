import { Schema, model } from "mongoose";

const tierSchema = new Schema({
  name: {
    type: Schema.Types.String,
    enum: ["free-tier", "tier-1", "tier-2", "tier-3"],
  },
  amount: {
    type: Schema.Types.Number,
  },

  isActive: {
    type: Schema.Types.Boolean,
    default: true,
  },
});

const tierModel = model("Tier", tierSchema);

export default tierModel;
