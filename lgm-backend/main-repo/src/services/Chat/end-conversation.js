import Conversation from "../../models/conversation-model.js";
import User from "../../models/user-model.js";
import Subscription from "../../models/subscription-model.js";
import Likes from "../../models/likes-model.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import logger from "../../logger/logger.js";
import { validate_end_conversation } from "../../utils/validators/user-validator.js";
import { startSession } from "mongoose";

export const end_conversation = async (req, res, next) => {
  const session = startSession();
  try {
    (await session).startTransaction();

    const { conversation } = req.body;

    await validate_end_conversation.validateAsync(req.body);

    const convo = await Conversation.findById(conversation);

    if (!convo) {
      return next(CustomError.createError("Conversation not found", 400));
    }

    const { sender, reciever, _id } = convo;

    await Conversation.findByIdAndUpdate(
      _id,
      {
        isEnded: true,
      },
      { new: true },
      session
    );

    await User.updateMany(
      {
        _id: [sender, reciever],
      },
      {
        isOccupied: false,
      },
      session
    );

    await Likes.updateOne(
      {
        $or: [{ userId: sender }, { likedUserId: reciever }],
      },
      {
        isDeleted: true,
      },
      session
    );
    // await Likes.updateOne({ userId: sender }, { isDeleted: true }, session);
    await Subscription.updateOne(
      { conversation: _id },
      { isDeleted: true },
      session
    );

    (await session).commitTransaction();

    return next(CustomSuccess.createSuccess("", "Conversation ended", 200));
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};
