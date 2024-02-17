import { Schema, model } from 'mongoose'
const CommentReactionSchema = new Schema(
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
      ref: 'PostComments',
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

const CommentReactionModel = model('CommentReactions', CommentReactionSchema)
export default CommentReactionModel
