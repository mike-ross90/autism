import mongoose, { Schema } from 'mongoose'

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Auth',
    },
    profileId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Profile',
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

const ReviewModel = mongoose.model('Review', ReviewSchema)

export default ReviewModel
