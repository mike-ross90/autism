import Payment from "../../models/payment-model.js";
import Subscription from "../../models/subscription-model.js";
import Conversation from "../../models/conversation-model.js";
import User from "../../models/user-model.js";
import Notification from "../../models/notification-model.js";
import logger from "../../logger/logger.js";
import config from "../../config/config.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import stripe_api from "stripe";
import { validate_make_payment } from "../../utils/validators/payment-validator.js";
import { send_notification_for_message } from "../../utils/send-notification.js";
import { startSession } from "mongoose";

export const user_make_payment = async (req, res, next) => {
  const session = startSession();
  const stripe = stripe_api(config.STRIPE_SECRET_KEY);
  try {
    (await session).startTransaction();
    const { body } = req;

    await validate_make_payment.validateAsync(body);

    const payment_intent_info = await stripe.paymentIntents.retrieve(
      body.paymentIntent
    );

    const subscription = await Subscription.findOne({
      userId: req.userId,
      isDeleted: false,
    });

    if (!subscription) {
      return next(
        CustomError.createError(
          "Subscription not found or has been removed",
          400
        )
      );
    }

    const validate_sub = validate_subscription(subscription, body.tierToUpdate);
    if (validate_sub) {
      return next(CustomError.createError(validate_sub, 400));
    }

    if (subscription.subscriptionType === body.tierToUpdate) {
      return next(
        CustomError.createError("You have already purchased this tier", 400)
      );
    }

    const subscription_expiry = set_subscription_expiry(
      subscription,
      body.paymentTime
    );

    if (!subscription_expiry) {
      return next(
        CustomError.createError(
          "You have already purchased the latest tier",
          400
        )
      );
    }

    if (payment_intent_info.status === "succeeded") {
      await new Payment({
        paymentIntent: payment_intent_info.id,
        paymentMethod: payment_intent_info.payment_method,
        chargeId: payment_intent_info.latest_charge,
        userId: req.userId,
        amount: payment_intent_info.amount_received / 100,
        currency: "usd",
        paymentMethodType: payment_intent_info.payment_method_types[0],
        status: payment_intent_info.status,
      }).save(session);

      await Subscription.updateOne(
        { userId: req.userId, _id: subscription._id },
        {
          subscriptionType: body.tierToUpdate,
          expiry: subscription_expiry,
        },
        session
      );

      const conversation = await Conversation.findOne({sender: req.userId}).populate('reciever');

      if (!conversation) {
        logger.debug('Conversation not found');
        return next(
          CustomError.createError(
            "Conversation not found",
            400
          )
        );
      }  
    

      if (conversation) {
        const reciever_userId = conversation.reciever._id;
        if(!reciever_userId){
          logger.debug('reciever_userId not found');
        }

        const reciever_profile = await User.findOne({ _id: reciever_userId }).populate('deviceInfo');
  
        if (!reciever_profile) {
          logger.debug('reciever profile not found');
          return next(
            CustomError.createError(
              "Reciever profile not found",
              400
            )
          );
        }  
  
        if (reciever_profile && reciever_profile.deviceInfo.length > 0) {
          const reciever_deviceToken = reciever_profile.deviceInfo[0].deviceToken;

          if (!reciever_deviceToken) {
            logger.debug('Reciever deviceToken not found');
            return next(
              CustomError.createError(
                "Reciever deviceToken not found",
                400
              )
            );
          }  

  
          send_notification_for_message({
            token: reciever_deviceToken,
            title: "",
            body: "",
            data: { userId: req.userId, likedUserId: reciever_userId },
          });
  
          await Notification.create({
            userId: req.userId,
            likedUserId: reciever_userId,
            title: "Tier updated",
            body: "Exciting update! Your chat partner on LGM (Let's Get Married) has advanced to a new tier in your conversation. Keep the meaningful conversation going and explore the path to a lasting relationship.",
          });
        }
      }

      (await session).commitTransaction();
      return next(
        CustomSuccess.createSuccess(
          "",
          `You have successfully purchased ${body.tierToUpdate}`,
          200
        )
      );
    }

    return next(
      CustomError.createError(
        "Something went wrong while processing the payment",
        400
      )
    );
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};

const set_subscription_expiry = (subscription, paymentTime) => {
  // const subscription_expiry = subscription.expiry;
  const new_subscription_expiry = new Date(paymentTime);

  if (subscription.subscriptionType === "free-tier") {
    //expiries need to be changed after testing

    // subscription_expiry.setDate(subscription_expiry.getDate() + 7);
    new_subscription_expiry.setMilliseconds(
      new_subscription_expiry.getMilliseconds() + 300000
    );
  } else if (subscription.subscriptionType === "tier-1") {
    // subscription_expiry.setDate(subscription_expiry.getDate() + 14);
    new_subscription_expiry.setMilliseconds(
      new_subscription_expiry.getMilliseconds() + 300000
    );
  } else if (subscription.subscriptionType === "tier-2") {
    // subscription_expiry.setDate(subscription_expiry.getDate() + 11);
    new_subscription_expiry.setMilliseconds(
      new_subscription_expiry.getMilliseconds() + 300000
    );
  } else {
    return false;
  }

  return new_subscription_expiry;
};

const validate_subscription = (subscription, purchased_subscription) => {
  return subscription.subscriptionType === "free-tier" &&
    purchased_subscription !== "tier-1"
    ? "You need to subscribe tier-1 first"
    : subscription.subscriptionType === "tier-1" &&
      purchased_subscription !== "tier-2"
    ? "You need to subscribe tier-2 first"
    : subscription.subscriptionType === "tier-3" &&
      (purchased_subscription === "tier-2" ||
        purchased_subscription === "tier-1")
    ? "You cannot unsubscribe to the previous tier"
    : subscription.subscriptionType === "tier-2" &&
      purchased_subscription === "tier-1"
    ? "You cannot unsubscribe to the previous tier"
    : null;
};
