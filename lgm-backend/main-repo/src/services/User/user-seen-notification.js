import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import logger from "../../logger/logger.js";
import Notification from "../../models/notification-model.js";
import { validate_seen_notification } from "../../utils/validators/user-validator.js";
import { Types } from "mongoose";

export const user_seen_notification = async (req, res, next) => {
    try {
        const { body } = req; //body will be containing notificationId

        await validate_seen_notification.validateAsync(body);

        const notification = await Notification.findByIdAndUpdate(
            body.notificationId,
            { isRead: true },
            { new: true }
        ).select('isRead -_id');               

        if (!notification) {
            return next(
              CustomError.createError(
                "Notification not found or has been removed",
                400
              )
            );
        }

        return next(
            CustomSuccess.createSuccess(
              notification,
              "Notification seen successfully",
              200
            )
        );
    } 
    catch (err) {
        logger.error(err.message);
        return next(CustomError.createError(err.message, 500));  
    }
};