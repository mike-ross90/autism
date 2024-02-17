import { Schema, model } from 'mongoose'
const GroupPostReactionSchema = new Schema(
  {
    reactionOn: {
      type: String,
      enum: ['Post', 'Comment'],
      required: true,
    },
    reactionType: {
      type: String,
      enum: ['Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry'],
      required: true,
      default: 'Like',
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'GroupPosts',
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const GroupPostReactionModel = model('GroupPostReactions', GroupPostReactionSchema)
export default GroupPostReactionModel
