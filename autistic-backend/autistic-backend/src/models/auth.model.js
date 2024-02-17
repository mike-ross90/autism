import mongoose, { Schema } from 'mongoose'
import { genSalt } from '../services/saltGen.js'
import bcrypt from 'bcrypt'

const AuthSchema = new Schema({
  name: {
    type: String,
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
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: false,
  },
  familyName: {
    type: String,
    required: function () {
      return this.userType === 'parent'
    },
  },
  OTP: {
    type: mongoose.Schema.Types.String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Schema.Types.Boolean,
    default: false,
  },
  socialIdentifier: {
    type: Schema.Types.String,
    default: null,
  },
  isNotification: {
    type: Schema.Types.Boolean,
    default: false,
  },
  isProfileCompleted: {
    type: Schema.Types.Boolean,
    default: false,
  },
  blockUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
    },
  ],
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
  devices: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Device',
    },
  ],
  loggedOutDevices: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Device',
    },
  ],
  socialType: {
    type: Schema.Types.String,
    enum: ['apple', 'facebook', 'google'],
  },
  userType: {
    type: Schema.Types.String,
    enum: ['parent', 'therapist', 'dietitian', 'pediatrician', 'counselor'],
    default: null,
    required: true,
  },
})

AuthSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, genSalt)
  }
  if (this.isModified('socialAccessToken')) {
    this.socialAccessToken = bcrypt.hashSync(this.socialAccessToken, genSalt)
  }
  if (this.isModified('profile')) {
    this.profile = bcrypt.hashSync(this.profile, genSalt)
  }
  if (this.isModified('socialIdentifier')) {
    this.socialIdentifier = bcrypt.hashSync(this.socialIdentifier, genSalt)
  }
  next()
})

const AuthModel = mongoose.model('Auth', AuthSchema)
export default AuthModel
