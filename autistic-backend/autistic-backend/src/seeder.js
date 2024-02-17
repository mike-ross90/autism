import dotenv from 'dotenv'
// eslint-disable-next-line no-unused-vars
import colors from 'colors'
import AuthModel from './models/auth.model.js'
import ProfileModel from './models/profile.model.js'

import connectDB from './db/db.js'
import DiagnosticModel from './models/pre-diagnostic.model.js'
import OtpModel from './models/otp.model.js'
import MediaModel from './models/media.model.js'
import PostsModel from './models/posts.model.js'
import ReviewModel from './models/review.model.js'
import ExpertiseModel from './models/expertise.model.js'
import DietsModel from './models/diet.model.js'
import DeviceModel from './models/device.model.js'
import CalendarModel from './models/calendar.model.js'
import NotesModel from './models/notes.model.js'
// import mongoose from 'mongoose'

dotenv.config()
await connectDB()

const destroyData = async () => {
  try {
    await AuthModel.deleteMany()
    await ProfileModel.deleteMany()
    await DiagnosticModel.deleteMany()
    await OtpModel.deleteMany()
    await MediaModel.deleteMany()
    await PostsModel.deleteMany()
    await ReviewModel.deleteMany()
    await ExpertiseModel.deleteMany()
    await DietsModel.deleteMany()
    await DeviceModel.deleteMany()
    await CalendarModel.deleteMany()
    await NotesModel.deleteMany()

    // await mongoose.connection.db.dropDatabase()
    console.log('Data Destroyed!'.green.bold)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
}
