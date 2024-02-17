import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'
import { genSalt } from '../services/saltGen.js'

const OtpSchema = new Schema(
  {
    otpKey: {
      type: Schema.Types.String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    otpUsed: {
      type: Schema.Types.Boolean,
      enum: [false, true],
      default: false,
    },
    verified: {
      type: Schema.Types.Boolean,
      enum: [false, true],
      default: false,
    },
    reason: {
      type: Schema.Types.String,
      required: true,
      enum: ['login', 'verification', 'resendOtp', 'forgotPassword'],
      default: 'verification',
    },
  },
  {
    timestamps: true,
  },
)

OtpSchema.pre('save', async function (next) {
  if (this.isModified('otpKey')) {
    this.otpKey = bcrypt.hashSync(this.otpKey, genSalt)
  }
})

const OtpModel = model('Otp', OtpSchema)

export default OtpModel
