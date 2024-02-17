import joi from "joi";

export const validate_create_account = joi.object({
  fullName: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  socialType: joi.string().valid("apple", "facebook", "google", ""),
  socialAccessToken: joi.string(),
  deviceToken: joi.string().required(),
  longitude: joi.number().required().min(-180).max(180),
  latitude: joi.number().required().min(-90).max(90),
});

export const validate_create_preferences = joi.object({
  likes: joi.array().items(joi.string()),
  interests: joi.array().items(joi.string()),
  hobbies: joi.array().items(joi.string()),
  images: joi.array().items(joi.string()),
});

export const validate_user_profile = joi.object({
  username: joi.string().required(),
  gender: joi.string().valid("Male", "Female", "Unspecified").required(),
  dateMonth: joi.number().min(1).max(12).required(),
  dateDay: joi.number().min(1).max(31).required(),
  dateYear: joi.number().min(1900).max(new Date().getFullYear()).required(),
  phone: joi.string().length(10).required(),
  country: joi.string().required(),
  about: joi.string(),
  profile_picture_url: joi.string(),
});

export const validate_user_login = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
  deviceToken: joi.string().required(),
  longitude: joi.number().required().min(-180).max(180),
  latitude: joi.number().required().min(-90).max(90),
});

export const validate_social_user_login = joi.object({
  email: joi.string().email().required(),
  fullName: joi.string().required(),
  socialType: joi.string().valid("apple", "facebook", "google", ""),
  deviceToken: joi.string().required(),
  longitude: joi.number().required().min(-180).max(180),
  latitude: joi.number().required().min(-90).max(90),
});

export const validate_user_logout = joi.object({
  deviceToken: joi.string().required(),
});

export const validate_forgot_password = joi.object({
  email: joi.string().email().required(),
});

export const validate_reset_password = joi.object({
  password: joi.string().required(),
});

export const validate_edit_profile = joi.object({
  //dateofbirth,gender,currentloc,jobtitle,companyName,school,bio,height
  //kids,drinking,language,relationship,smoking,christiandenomination,pets,personality,education,interests
  phone: joi.string().length(10).allow(""),
  dateMonth: joi.number().min(1).max(12).required().allow(""),
  dateDay: joi.number().min(1).max(31).required().allow(""),
  dateYear: joi
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .allow(""),
  gender: joi.string().valid("Male", "Female", "Unspecified").allow(""),
  currentLoc: joi.string().allow(""),
  jobTitle: joi.string().allow("").messages({
    "string.empty": `Work details not allowed to be empty`,
  }),
  companyName: joi.string().allow("").messages({
    "string.empty": `Work details not allowed to be empty`,
  }),
  // school: joi.string().allow(""),
  bio: joi.string().allow("").messages({
    "string.empty": `Bio not allowed to be empty`,
  }),
  height: joi.number().allow("").messages({
    "number.empty": `Height not allowed to be empty`,
  }),
  kids: joi.string().allow(""),
  drinking: joi.string().valid("Yes", "Never", "I'd rather not say").allow(""),
  languages: joi.array().items(
    joi.string().allow("").messages({
      "string.empty": `Languages not allowed to be empty`,
    })
  ),
  relationshipStatus: joi.string().valid("Single", "Married").allow(""),
  smoking: joi.string().valid("Yes", "No", "Sometimes", ""),
  christianDenomination: joi.array().items(joi.string().allow("")).allow(""),
  pets: joi.string().allow(""),
  personality: joi
    .string()
    .valid("Introvert", "Extrovert", "Somewhere in between", ""),
  educationLevel: joi
    .string()
    .valid("High School Diploma", "Undergraduate", "Postgraduate", "")
    .allow("")
    .messages({
      "string.empty": `Education details" is not allowed to be empty`,
    }),

  school: joi.string().allow("").messages({
    "string.empty": `Education details" is not allowed to be empty`,
  }),
  degree: joi.string().allow("").messages({
    "string.empty": `Education details" is not allowed to be empty`,
  }),
  interests: joi.array().items(joi.string()).allow(""),
  likes: joi.array().items(joi.string()).allow(""),
  hobbies: joi.array().items(joi.string()).allow(""),
  favBibleVerse: joi.string().allow(""),
  bibleIdentification: joi.string().allow(""),
  imageIndex: joi.array().items(joi.number()).allow(""),
  // profile_picture_url: joi.string(),
  // images: joi.string(),
});

export const validate_search_user = joi.object({
  prompt: joi.string(),
});

const validate_range = (value, helpers) => {
  const parts = value.split("-");
  const min_value = parseInt(parts[0]);
  const max_value = parseInt(parts[1]);

  if (isNaN(min_value) || isNaN(max_value) || min_value > max_value) {
    return helpers.error("any.invalid");
  }

  return value;
};

export const validate_filter_params = joi.object({
  age: joi.string().custom(validate_range, "custom validation"),
  distance: joi.number().required(),
});

export const validate_other_user_profile = joi.object({
  userId: joi.string().required(),
});

export const validate_end_conversation = joi.object({
  conversation: joi.string().required(),
});

export const validate_feedback = joi.object({
  subject: joi.string().required(),
  message: joi.string().required(),
});

export const validate_seen_notification = joi.object({
  notificationId: joi.string().required(),
});

export const validate_user_questions = joi.object({
  question: joi.string().required(),
  type: joi.string().required(),
});
export const validate_user_edit_answer = joi.object({
  id: joi.string().required(),
  answer: joi.string().required(),
});
