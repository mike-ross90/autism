import { Schema, model } from 'mongoose'

const AdminMediaSchema = new Schema(
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const AdminMediaModel = model('AdminMedia', AdminMediaSchema)

export default AdminMediaModel
