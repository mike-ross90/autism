import mongoose, { Schema } from 'mongoose'

const DietsSchema = new mongoose.Schema(
  {
    dietitianId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
    },
    parentId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    startDate: {
      type: Schema.Types.Date,
      required: true,
    },
    endDate: {
      type: Schema.Types.Date,
      required: true,
    },
    breakfast: [
      {
        type: Schema.Types.String,
        required: false,
      },
    ],
    lunch: [
      {
        type: Schema.Types.String,
        required: false,
      },
    ],
    brunch: [
      {
        type: Schema.Types.String,
        required: false,
      },
    ],
    dinner: [
      {
        type: Schema.Types.String,
        required: false,
      },
    ],
  },
  { timestamps: true },
)

const DietsModel = mongoose.model('Diets', DietsSchema)

export default DietsModel
