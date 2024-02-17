import mongoose, { Schema } from 'mongoose'

const ActionSchema = new Schema(
  {
    image: {
      type: Schema.Types.ObjectId,
      ref: 'AdminMedia',
      default: '',
    },
    title: {
      type: Schema.Types.String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

const ActionModel = mongoose.model('Action', ActionSchema)
export default ActionModel
