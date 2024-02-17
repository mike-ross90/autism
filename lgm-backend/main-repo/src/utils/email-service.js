import logger from "../logger/logger.js";
import nodemailer from "nodemailer";
import config from "../config/config.js";

export const send_email = async (to, subject, content) => {
  try {
    let transporter = nodemailer.createTransport({
      host: config.MAIL_HOST,
      port: config.MAIL_PORT,
      auth: {
        user: config.MAIL_USERNAME,
        pass: config.MAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: config.MAIL_USERNAME,
      to: to,
      subject: subject,
      html: content,
    });
  } catch (err) {
    logger.error(err.message);
  }
};

export const send_reply_email_from_admin = async (
  to,
  from,
  subject,
  content
) => {
  try {
    let transporter = nodemailer.createTransport({
      host: config.MAIL_HOST,
      port: config.MAIL_PORT,
      auth: {
        user: config.MAIL_USERNAME,
        pass: config.MAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      to: to,
      from: from,
      subject: subject,
      text: content,
      replyTo: from,
    });
  } catch (err) {
    logger.error(err.message);
  }
};
