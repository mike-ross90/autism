import mongoose, { Schema } from 'mongoose'

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    title: {
      type: Schema.Types.String,
      required: true,
    },
    message: {
      type: Schema.Types.String,
      required: true,
    },
    // notificationType: {
    //   type: Schema.Types.String,
    //   enum: ['info', 'warning', 'error'], // You can define your notification types
    // },
    isRead: {
      type: Schema.Types.Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const NotificationModel = mongoose.model('Notification', NotificationSchema)

export default NotificationModel
