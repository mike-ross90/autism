import { Schema, model } from 'mongoose'
const PostCommentSchema = new Schema(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comments',
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
    },
    replayTo: {
      type: Schema.Types.ObjectId,
      ref: 'Replay',
    },
    message: {
      type: Schema.Types.String,
      default: null,
      required: true,
    },
    isDeleted: {
      type: Schema.Types.Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const PostCommentModel = model('Replay', PostCommentSchema)
export default PostCommentModel
