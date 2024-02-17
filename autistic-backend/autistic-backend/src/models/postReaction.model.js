import { Schema, model } from 'mongoose'
const PostReactionSchema = new Schema(
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
      ref: 'Posts',
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

const PostReactionModel = model('PostReactions', PostReactionSchema)
export default PostReactionModel
