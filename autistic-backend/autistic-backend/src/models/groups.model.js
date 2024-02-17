import { Schema, model } from 'mongoose'

const GroupSchema = new Schema(
  {
    title: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      required: false,
    },
    profileImage: {
      type: Schema.Types.ObjectId,
      ref: 'AdminMedia',
      required: true,
      default: null,
    },
    coverImage: {
      type: Schema.Types.ObjectId,
      ref: 'AdminMedia',
      required: true,
      default: null,
    },
    isDeleted: {
      type: Schema.Types.Boolean,
      default: false,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Auth',
      },
    ],
  },
  {
    timestamps: true,
  },
)

const GroupModel = model('Group', GroupSchema)

export default GroupModel
