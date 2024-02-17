import Profile from "../../models/profile-model.js";
import logger from "../../logger/logger.js";
import Preferences from "../../models/preferences-model.js";
import { validate_edit_profile } from "../../utils/validators/user-validator.js";
import CustomError from "../../utils/custom-response/custom-error.js";
import CustomSuccess from "../../utils/custom-response/custom-success.js";
import { startSession } from "mongoose";

export const user_edit_profile = async (req, res, next) => {
  //userId retrieved from middleware (req.userId)
  const session = startSession();

  try {
    (await session).startTransaction();

    const { body } = req;

    await validate_edit_profile.validateAsync(body);

    let edit_profile = null;

    if (!("images" in req.files)) {
      edit_profile = await Preferences.findOneAndUpdate(
        { userId: req.userId },
        {
          interests: body.interests,
          likes: body.likes,
          hobbies: body.hobbies,
        },

        { returnDocument: "after" },
        {
          session,
        }
      );
    } else {
      const images = req?.files?.images?.map((file) => file.key.split("/")[2]);
      const update_obj = {};
      body.imageIndex.forEach((index, i) => {
        update_obj[`images.${index}`] = images[i];
      });

      edit_profile = await Preferences.findOneAndUpdate(
        { userId: req.userId },
        {
          interests: body.interests,
          likes: body.likes,
          hobbies: body.hobbies,
          $set: update_obj,
        },

        { returnDocument: "after" },
        {
          session,
        }
      );
    }

    if (!("profile_picture_url" in req.files)) {
      edit_profile = await Profile.findOneAndUpdate(
        { userId: req.userId },
        {
          dateOfBirth: {
            dateMonth: body.dateMonth,
            dateDay: body.dateDay,
            dateYear: body.dateYear,
          },
          gender: body.gender,
          currentLoc: body.currentLoc,
          work: {
            jobTitle: body.jobTitle,
            companyName: body.companyName,
          },
          height: body.height,
          kids: body.kids,
          drinking: body.drinking,
          languages: body.languages,
          relationshipStatus: body.relationshipStatus,
          smoking: body.smoking,
          christianDenomination: body.christianDenomination,
          pets: body.pets,
          personality: body.personality,
          phone: body.phone,
          bio: body.bio,
          bibleIdentification: body.bibleIdentification,
          favBibleVerse: body.favBibleVerse,
          educationLevel: body.educationLevel,
          education: {
            school: body.school,
            degree: body.degree,
          },
        },

        { returnDocument: "after" },
        { session }
      ).populate("preferencesInfo");
    } else {
      const profile_pic = req?.files?.profile_picture_url[0].key.split("/")[2];
      edit_profile = await Profile.findOneAndUpdate(
        { userId: req.userId },
        {
          dateOfBirth: {
            dateMonth: body.dateMonth,
            dateDay: body.dateDay,
            dateYear: body.dateYear,
          },
          gender: body.gender,
          currentLoc: body.currentLoc,
          work: {
            jobTitle: body.jobTitle,
            companyName: body.companyName,
          },
          height: body.height,
          kids: body.kids,
          drinking: body.drinking,
          languages: body.languages,
          relationshipStatus: body.relationshipStatus,
          smoking: body.smoking,
          christianDenomination: body.christianDenomination,
          pets: body.pets,
          personality: body.personality,
          profile_picture_url: profile_pic,
          phone: body.phone,
          bio: body.bio,
          bibleIdentification: body.bibleIdentification,
          favBibleVerse: body.favBibleVerse,
          educationLevel: body.educationLevel,
          education: {
            school: body.school,
            degree: body.degree,
          },
        },

        { returnDocument: "after" },
        { session }
      ).populate("preferencesInfo");
    }

    (await session).commitTransaction();

    if (edit_profile) {
      return next(
        CustomSuccess.createSuccess(
          edit_profile,
          "Profile updated successfully",
          200
        )
      );
    }

    return next(
      CustomSuccess.createSuccess(edit_profile, "user profile not updated", 200)
    );
  } catch (err) {
    (await session).abortTransaction();
    logger.error(err.message);
    return next(CustomError.createError(err.message, 500));
  } finally {
    (await session).endSession();
  }
};
