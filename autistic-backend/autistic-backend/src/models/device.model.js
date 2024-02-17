import mongoose, { Schema } from 'mongoose'

const DeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      unique: true,
      required: true,
    },
    deviceType: {
      type: Schema.Types.String,
      enum: ['android', 'ios', 'web', 'postman'],
    },
    deviceToken: {
      type: Schema.Types.String,
      default: '',
    },
    status: {
      type: Schema.Types.String,
      enum: ['active', 'inactive', 'isBlocked'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
)

const DeviceModel = mongoose.model('Device', DeviceSchema)

export default DeviceModel
