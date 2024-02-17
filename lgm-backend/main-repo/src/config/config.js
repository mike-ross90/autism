import dotenv from "dotenv";
import findconfig from "find-config";

dotenv.config({ path: findconfig(".env") });

export default {
  DB_URI: process.env.DB_URI,
  PORT: process.env.PORT,
  PW_SALT_VAL: process.env.PW_SALT_VAL,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USERNAME: process.env.MAIL_USERNAME,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ADMIN_SECRET: process.env.JWT_ADMIN_SECRET,
  EXPIRES_IN: process.env.EXPIRES_IN,
  BEARER_TOKEN: process.env.BEARER_TOKEN,
  ADMIN_BEARER_TOKEN: process.env.ADMIN_BEARER_TOKEN,
  RABBIT_QUEUE: process.env.RABBIT_QUEUE,
  RABBIT_MQ_CONNECTION_URL: process.env.RABBIT_MQ_CONNECTION_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  S3_REGION: process.env.S3_REGION,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_DESTINATION: process.env.S3_DESTINATION,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
};
