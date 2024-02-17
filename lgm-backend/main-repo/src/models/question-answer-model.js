import { Schema, model } from "mongoose";

const questionAnswerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    question: {
      type: Schema.Types.String,
      default: "",
    },
    answer: {
      type: Schema.Types.String,
      default: "",
    },
    // completed: {
    //   type: Schema.Types.Boolean,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
);

const questionAnswerModel = model("QuestionAnswer", questionAnswerSchema);

export default questionAnswerModel;
