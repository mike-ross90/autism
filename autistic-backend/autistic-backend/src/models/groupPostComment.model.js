import { Schema, model } from 'mongoose'
const GroupPostCommentSchema = new Schema(
  {
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
    postComment: {
      type: Schema.Types.String,
      default: null,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const GroupPostCommentModel = model('GroupPostComments', GroupPostCommentSchema)
export default GroupPostCommentModel
