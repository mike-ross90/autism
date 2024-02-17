import { Schema, model } from 'mongoose'

const GroupRequestSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      default: null,
    },
    isJoined: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const GroupRequestModel = model('GroupRequest', GroupRequestSchema)

export default GroupRequestModel
