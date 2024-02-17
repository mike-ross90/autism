import mongoose, { Schema } from 'mongoose'

const ChatRoomSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'ChatMessage',
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

const ChatRoomModel = mongoose.model('ChatRoom', ChatRoomSchema)
export default ChatRoomModel
