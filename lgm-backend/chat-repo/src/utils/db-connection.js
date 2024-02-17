import mongoose from "mongoose";
import config from "../config/config.js";
import logger from "../logger/logger.js";

export const connect_to_db = async () => {
  try {
    mongoose.connect(config.DB_URI);
    logger.info("Connected to DB [CHAT]..");
  } catch (e) {
    logger.error(e.message);
  }
};
