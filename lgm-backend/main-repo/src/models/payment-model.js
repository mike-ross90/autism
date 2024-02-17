import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    paymentIntent: { type: Schema.Types.String, required: true },
    paymentMethod: { type: Schema.Types.String, required: true },
    chargeId: { type: Schema.Types.String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    amount: { type: Schema.Types.Number, required: true },
    currency: { type: Schema.Types.String, required: true, enum: ["usd"] },
    paymentMethodType: {
      type: Schema.Types.String,
      required: true,
      enum: ["card"],
    },
    status: { type: Schema.Types.String, required: true },
  },
  {
    timestamps: true,
  }
);

const paymentModel = model("Payment", paymentSchema);

export default paymentModel;
