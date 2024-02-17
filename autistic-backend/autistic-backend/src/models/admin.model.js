import mongoose, { Schema } from 'mongoose'

const AdminSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
  },
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  userType: {
    type: Schema.Types.String,
    enum: ['admin'],
  },
  password: {
    type: Schema.Types.String,
    required: true,
  },
})

const AdminModel = mongoose.model('Admin', AdminSchema)

export default AdminModel
