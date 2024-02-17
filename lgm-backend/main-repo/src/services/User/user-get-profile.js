import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import Profile from "../../models/profile-model.js";
import logger from "../../logger/logger.js";
import questionAnswerModel from "../../models/question-answer-model.js";

// export const user_get_profile = async (req, res, next) => {
//   try {
//     const profile = await Profile.findOne({ userId: req.userId })
//       .populate({
//         path: "userId",
//         model: "User",
//         select: { isVerified: 1, _id: 0 },
//       })
//       .populate({
//         path: "preferencesInfo",
//         model: "Preferences",
//         select: { createdAt: 0, updatedAt: 0, __v: 0, _id: 0, userId: 0 },
//       })
//       .select("-_id -createdAt -updatedAt -__v");

//     const Questons = await questionAnswerModel
//       .find({ userId: req.userId })
//       .select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0, userId: 0 });
//     console.log(Questons);

//     if (profile) {
//       return next(
//         CustomSuccess.createSuccess(
//           profile,
//           "user profile fetched successfully",
//           200
//         )
//       );
//     }
//     return next(CustomError.createError("user profile not found", 400));
//   } catch (err) {
//     logger.error(err.message);
//     return next(CustomError.createError(err.message, 500));
//   }
// };

export const user_get_profile = async (req, res, next) => {
  try {
    const profilePromise = Profile.findOne({ userId: req.userId })
      .populate({
        path: "userId",
        model: "User",
        select: { isVerified: 1, _id: 0 },
      })
      .populate({
        path: "preferencesInfo",
        model: "Preferences",
        select: { createdAt: 0, updatedAt: 0, __v: 0, _id: 0, userId: 0 },
      })
      .select("-_id -createdAt -updatedAt -__v");

    const questionsPromise = questionAnswerModel
      .find({ userId: req.userId })
      .select({ createdAt: 0, updatedAt: 0, __v: 0, userId: 0 });

    const [profile, questions] = await Promise.all([
      profilePromise,
      questionsPromise,
    ]);

    if (profile) {
      const profileObj = profile.toObject();

      // Merge questions into the profile object
      profileObj.questions = questions;
      // console.log(profileObj);

      const result = {
        user: {
          isVerified: profile.userId.isVerified,
        },
        profile: profileObj,
      };
      return next(
        CustomSuccess.createSuccess(
          result.profile,
          "User profile fetched successfully",
          200
        )
      );
    }
    return next(CustomError.createError("User profile not found", 400));
  } catch (err) {
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  }
};
