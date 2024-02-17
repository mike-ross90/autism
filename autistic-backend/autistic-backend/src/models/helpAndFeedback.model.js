import { Schema, model } from 'mongoose'

const HelpAndFeedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
    },
    name: {
      type: Schema.Types.String,
      required: false,
    },
    subject: {
      type: Schema.Types.String,
      required: false,
    },
    email: {
      type: Schema.Types.String,
      required: false,
    },
    message: {
      type: Schema.Types.String,
      required: false,
    },
    image: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Media',
      },
    ],
  },
  {
    timestamps: true,
  },
)

const HelpAndFeedbackModel = model('Feedback', HelpAndFeedbackSchema)

export default HelpAndFeedbackModel
