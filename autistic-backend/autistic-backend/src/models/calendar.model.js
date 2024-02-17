import mongoose, { Schema } from 'mongoose'

const CalendarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true,
  },
  day: {
    type: Schema.Types.String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  startTime: {
    type: Schema.Types.String,
    required: true,
  },
  endTime: {
    type: Schema.Types.String,
    required: true,
  },
  status: {
    type: Schema.Types.String,
    enum: [false, true],
    default: false,
  },
})

const CalendarModel = mongoose.model('Calendar', CalendarSchema)

export default CalendarModel
