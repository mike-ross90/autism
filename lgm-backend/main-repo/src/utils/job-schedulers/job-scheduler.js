import cron from "node-cron";
import User from "../../models/user-model.js";
import logger from "../../logger/logger.js";

const resetRecommendations = async () => {
  try {
    await User.updateMany(
      {},
      {
        recommendationLimit: 5,
      }
    );
  } catch (err) {
    logger.error(err.message);
  }
};

const scheduleJobs = () => {
  logger.info("reset recommendation job scheduled..");
  cron.schedule(
    "59 23 * * *",
    () => {
      resetRecommendations();
      logger.info("reset recommendations successful..");
    },
    {
      scheduled: true,
      timezone: "Asia/Karachi",
    }
  );
};

export { scheduleJobs };
