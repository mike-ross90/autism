import Otp from "../models/otp-model.js";
import logger from "../logger/logger.js";

export const generate_and_save_otp = async (user_id) => {
  try {
    const otp = (Math.floor(Math.random() * 10000) + 10000)
      .toString()
      .substring(1);

    const old_otp = await Otp.findOne({ userId: user_id });

    if (!old_otp) {
      await Otp.create({
        otpKey: otp,
        userId: user_id,
      });
    } else {
      const new_expiry = new Date(Date.now() + 10 * 60 * 1000);
      await Otp.findOneAndUpdate(
        { userId: user_id },
        {
          otpKey: otp,
          expiry: new_expiry,
        }
      );
    }
    return otp;
  } catch (err) {
    logger.error(err.message);
  }
};

export const verify_otp_expiry = async (user_id) => {
  try {
    const currentTime = new Date();
    const otp_info = await Otp.findOne({ userId: user_id });
    if (!otp_info || currentTime > otp_info.expiry) return false;
    return true;
  } catch (err) {
    logger.error(err.message);
  }
};
