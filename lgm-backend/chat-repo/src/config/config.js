import dotenv from "dotenv";
import findconfig from "find-config";

dotenv.config({ path: findconfig(".env") });

export default {
  DB_URI: process.env.DB_URI,
  PORT: process.env.PORT,
  RABBIT_QUEUE: process.env.RABBIT_QUEUE,
  RABBIT_MQ_CONNECTION_URL: process.env.RABBIT_MQ_CONNECTION_URL,
};
