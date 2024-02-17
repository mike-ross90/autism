import mongoose, { Schema } from 'mongoose'

const DiagnosticSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    calendarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Calendar',
      required: true,
    },
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: true,
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
    patientName: {
      type: Schema.Types.String,
      required: true,
    },
    location: {
      type: {
        type: Schema.Types.String,
        enum: ['Point'],
        default: 'Point',
        required: false,
      },
      coordinates: {
        type: [Schema.Types.Number],
        required: false,
      },
    },
    status: {
      type: Schema.Types.String,
      enum: ['confirmed', 'completed', 'cancelled', 'pending'],
      default: 'pending',
      required: true,
    },

    isAccepted: {
      type: Schema.Types.Boolean,
      default: false,
    },

    dateOfBirth: { type: Schema.Types.Date, required: true },

    age: { type: Schema.Types.Number, required: true },

    gender: { type: Schema.Types.String, enum: ['male', 'female'] },
  },
  {
    timestamps: true,
  },
)

const DiagnosticModel = mongoose.model('Pre-Diagnostic', DiagnosticSchema)

export default DiagnosticModel
