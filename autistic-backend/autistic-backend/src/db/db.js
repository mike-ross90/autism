import mongoose from 'mongoose'
import dbConfig from '../config/db.config.js'

const connectDB = async () => {
  mongoose.set({
    strictQuery: true,
  })
  try {
    const connection = await mongoose.connect(dbConfig.db, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    console.log(`MongoDB Connected Successfully: ${connection.connection.host}`.cyan.underline)
  } catch (error) {
    console.log(`Error ${error.message}`.red.underline.bold)
    process.exit(1) // => it means exit with failure if error
  }
}

export default connectDB
