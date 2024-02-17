import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Auth',
    },
    name: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      default: null,
    },
    dateOfBirth: {
      type: Schema.Types.Date,
      default: null,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
      default: null,
    },
    country: {
      type: Schema.Types.String,
      default: null,
    },
    city: {
      type: Schema.Types.String,
      default: null,
    },
    state: {
      type: Schema.Types.String,
      default: null,
    },
    childrens: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Child',
        default: null,
      },
    ],
  },
  {
    timestamps: true,
  },
)

const UserModel = mongoose.model('User', UserSchema)
export default UserModel
