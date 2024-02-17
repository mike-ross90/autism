import mongoose from 'mongoose'

const NotesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    title: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    description: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
  },
  { timestamps: true },
)

const NotesModel = mongoose.model('Notes', NotesSchema)

export default NotesModel
