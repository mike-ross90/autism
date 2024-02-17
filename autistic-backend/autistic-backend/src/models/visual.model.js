import mongoose, { Schema } from 'mongoose'

const VisualSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
    },
    day: {
      type: Schema.Types.String,
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    time: {
      type: Schema.Types.String,
      default: '',
    },
    action: {
      type: Schema.Types.ObjectId,
      ref: 'Action',
    },
    // endTime: {
    //   type: Schema.Types.String,
    //   required: true,
    // },
    description: {
      type: Schema.Types.String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

const VisualModel = mongoose.model('Visual', VisualSchema)
export default VisualModel
