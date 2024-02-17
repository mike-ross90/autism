import { Schema, model } from "mongoose";

const onlyQuestionSchema = new Schema(
  {
    question: {
      type: Schema.Types.String,
      default: "",
    },
    type: {
      type: Schema.Types.String,
      default: "text",
    },
  },
  {
    timestamps: true,
  }
);

const Onlyquestion = model("Onlyquestions", onlyQuestionSchema);

export default Onlyquestion;
