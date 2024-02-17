import { Schema, model } from 'mongoose'
const reportTagSchema = new Schema(
  {
    tag: {
      type: Schema.Types.String,
      require: true,
    },
  },
  {
    timestamps: true,
  },
)

const ReportTagModel = model('ReportTag', reportTagSchema)
export default ReportTagModel
