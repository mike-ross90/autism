import mongoose, { Schema } from 'mongoose'

const ChildSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
    },
    fullName: {
      type: Schema.Types.String,
      required: true,
    },
    dateOfBirth: {
      type: Schema.Types.Date,
      default: null,
      required: false,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
    },
    gender: {
      type: Schema.Types.String,
      enum: ['male', 'female'],
      required: true,
    },
  },
  { timestamps: true },
)

const ChildModel = mongoose.model('Child', ChildSchema)

export default ChildModel
