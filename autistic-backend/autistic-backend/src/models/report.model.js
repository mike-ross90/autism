import { Schema, model } from 'mongoose'

const reportTagEnum = ['bad', 'fake', 'other']
const reportedTypeEnum = ['Post', 'Comment', 'Reply']

const ReportSchema = new Schema(
  {
    reportedToId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    tag: {
      type: Schema.Types.String,
      enum: reportTagEnum,
      required: true,
    },
    reportedType: {
      type: Schema.Types.String,
      enum: reportedTypeEnum,
      required: true,
    },
    reason: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Middleware to ensure enum values
ReportSchema.pre('save', function (next) {
  if (!reportTagEnum.includes(this.tag)) {
    return next(new Error(`Invalid tag value: ${this.tag} select from ${reportTagEnum}`))
  }
  if (!reportedTypeEnum.includes(this.reportedType)) {
    return next(
      new Error(`Invalid reportedType value: ${this.reportedType} select from ${reportedTypeEnum}`),
    )
  }
  next()
})

const ReportModel = model('Report', ReportSchema)
export default ReportModel
