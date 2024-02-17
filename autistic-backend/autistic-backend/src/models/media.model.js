import { Schema, model } from 'mongoose'

const MediaSchema = new Schema(
  {
    mediaType: {
      type: Schema.Types.String,
      enum: ['image', 'video', 'audio'],
      required: true,
    },
    mediaUrl: {
      type: Schema.Types.String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    userType: {
      type: Schema.Types.String,
      enum: ['therapist', 'parent', 'dietitian', 'pediatrician', 'counselor'],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const MediaModel = model('Media', MediaSchema)

export default MediaModel
