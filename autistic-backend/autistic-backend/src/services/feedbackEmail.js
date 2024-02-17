import nodemailer from 'nodemailer'
import { emailConfig } from '../config/email.config.js'

const transporter = nodemailer.createTransport(emailConfig)
export const sendFeedbackEmail = (to, headline, content, attachments, replyTo, next) => {
  try {
    // console.log(attachments, 'aaaa')
    const message = {
      from: {
        name: process.env.MAIL_FROM_NAME,
        address: process.env.MAIL_USERNAME,
      },
      to: to,
      headline: headline,
      html: content,
      attachments,
      replyTo,
    }
    transporter.sendMail(message, next)
  } catch (error) {
    console.error(error)
  }
}
