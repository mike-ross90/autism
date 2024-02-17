import mongoose, { Schema } from 'mongoose'

const PolicySchema = new Schema(
  {
    type: {
      type: Schema.Types.String,
      enum: ['terms', 'about', 'privacy'],
    },
    content: {
      type: Schema.Types.String,
    },
  },
  {
    timestamps: true,
  },
)

const PolicyModel = mongoose.model('Policy', PolicySchema)
export default PolicyModel
