import mongoose, { Schema } from 'mongoose'

const ExpertiseSchema = new mongoose.Schema(
  {
    userType: {
      type: Schema.Types.String,
      enum: ['therapist', 'dietitian', 'pediatrician', 'counselor'],
      default: null,
      required: true,
    },
    skill: {
      type: Schema.Types.String,
      required: true,
    },
  },
  { timestamps: true },
)

const ExpertiseModel = mongoose.model('Expertise', ExpertiseSchema)

export default ExpertiseModel
