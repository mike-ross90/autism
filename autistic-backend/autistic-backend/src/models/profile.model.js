import mongoose, { Schema } from 'mongoose'

const profileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
    },
    fullName: {
      type: Schema.Types.String,
      required: true,
    },
    contactNo: {
      type: Schema.Types.String,
      required: true,
    },
    dateOfBirth: {
      type: Schema.Types.Date,
      default: null,
      required: false,
    },
    country: {
      type: Schema.Types.String,
      default: true,
    },
    city: {
      type: Schema.Types.String,
      default: true,
    },
    state: {
      type: Schema.Types.String,
      default: true,
    },
    // location: {
    //   type: {
    //     type: Schema.Types.String,
    //     enum: ['Point'],
    //     default: 'Point',
    //     required: false,
    //   },
    //   coordinates: {
    //     type: [Schema.Types.Number],
    //     required: false,
    //   },
    // },
    description: {
      type: Schema.Types.String,
      default: null,
      required: false,
    },
    expertise: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Expertise',
      },
    ],
    image: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
      default: null,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true,
  },
)

const ProfileModel = mongoose.model('Profile', profileSchema)
export default ProfileModel
