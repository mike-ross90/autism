import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import Tier from "../../models/tier-model.js";
import Subscription from "../../models/subscription-model.js";
import logger from "../../logger/logger.js";

export const user_get_tier_info = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.userId,
      isDeleted: false,
    });

    if (!subscription) {
      return next(
        CustomError.createError(
          "Subscription not found or conversation ended by the user",
          400
        )
      );
    }

    const get_tier_info =
      subscription.subscriptionType === "free-tier"
        ? await Tier.findOne({ isActive: true, name: "tier-1" }).select(
            "-createdAt -updatedAt"
          )
        : subscription.subscriptionType === "tier-1"
        ? await Tier.findOne({ isActive: true, name: "tier-2" }).select(
            "-createdAt -updatedAt"
          )
        : subscription.subscriptionType === "tier-2"
        ? await Tier.findOne({ isActive: true, name: "tier-3" }).select(
            "-createdAt -updatedAt"
          )
        : [];

    if (get_tier_info.length === 0) {
      return next(
        CustomSuccess.createSuccess(get_tier_info, "No tiers found", 200)
      );
    }

    return next(
      CustomSuccess.createSuccess(
        get_tier_info,
        "Tiers fetched successfully",
        200
      )
    );
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
