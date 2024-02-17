import { Schema, model } from 'mongoose'
const GroupPostsSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    postMedia: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Media',
        // required: true,
      },
    ],
    postMediaType: {
      type: Schema.Types.String,
      enum: ['image', 'video'],
      // required: true,
    },
    isDeleted: {
      type: Schema.Types.Boolean,
      default: false,
    },
    postCaption: {
      type: Schema.Types.String,
      default: null,
    },
    reported: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Auth',
        default: null,
      },
    ],
    hidePost: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Auth',
        default: null,
      },
    ],
    postThumbnail: {
      type: Schema.Types.String,
      default: null,
    },
    isShared: {
      type: Schema.Types.Boolean,
      default: false,
    },
    originalPost: {
      type: Schema.Types.ObjectId,
      ref: 'GroupPosts',
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

const GroupPostsModel = model('GroupPosts', GroupPostsSchema)

export default GroupPostsModel
