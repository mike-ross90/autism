import { Schema, model } from 'mongoose'
const GroupCommentReactionSchema = new Schema(
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
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'GroupPostComments',
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

const GroupCommentReactionModel = model('GroupCommentReactions', GroupCommentReactionSchema)
export default GroupCommentReactionModel
