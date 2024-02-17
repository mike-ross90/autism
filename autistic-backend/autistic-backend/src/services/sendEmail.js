import nodemailer from 'nodemailer'
import { emailConfig } from '../config/email.config.js'

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(emailConfig)
export const sendEmails = (to, subject, content, attachments, next) => {
  try {
    const message = {
      from: {
        name: process.env.MAIL_FROM_NAME,
        address: process.env.MAIL_USERNAME,
      },
      to,
      subject,
      html: content,
      attachments,
    }
    console.log('Email send successfully')
    transporter.sendMail(message, next)
  } catch (error) {
    console.error(error, 'Email send failed')
    throw new Error(error, { cause: error })
  }
}
