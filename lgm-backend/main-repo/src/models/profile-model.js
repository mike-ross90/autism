import { Schema, model } from "mongoose";

const profileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    preferencesInfo: {
      type: Schema.Types.ObjectId,
      ref: "Preferences",
      default: null,
    },
    username: { type: Schema.Types.String, unique: true },
    gender: {
      type: Schema.Types.String,
      enum: ["Male", "Female", "Unspecified"],
    },
    dateOfBirth: {
      dateMonth: { type: Schema.Types.Number },
      dateDay: { type: Schema.Types.Number },
      dateYear: { type: Schema.Types.Number },
    },
    age: { type: Schema.Types.Number },
    profile_picture_url: { type: Schema.Types.String, default: "" },
    country: { type: Schema.Types.String },
    about: { type: Schema.Types.String, default: "" },
    bio: { type: Schema.Types.String, default: "" },
    phone: { type: Schema.Types.String, unique: true },
    currentLoc: { type: Schema.Types.String, default: "" },
    work: {
      jobTitle: { type: Schema.Types.String, default: "" },
      companyName: { type: Schema.Types.String, default: "" },
    },
    // school: {
    //   type: Schema.Types.String,
    //   default: "",
    //   enum: ["Yes", "No", "Sometimes", ""],
    // },
    height: { type: Schema.Types.Number, default: 0 },
    kids: { type: Schema.Types.String, default: "" },
    drinking: {
      type: Schema.Types.String,
      enum: ["Yes", "Never", "I'd rather not say", ""],
      default: "",
    },
    languages: { type: Schema.Types.Array },
    relationshipStatus: {
      type: Schema.Types.String,
      default: "",
      enum: ["Single", "Married", ""],
    },
    smoking: {
      type: Schema.Types.String,
      default: "",
      enum: ["Yes", "No", "Sometimes", ""],
    },
    christianDenomination: { type: Schema.Types.Array },
    pets: { type: Schema.Types.String, default: "" },
    personality: {
      type: Schema.Types.String,
      default: "",
      enum: ["Introvert", "Extrovert", "Somewhere in between", ""],
    },
    education: {
      school: { type: Schema.Types.String, default: "" },
      degree: { type: Schema.Types.String, default: "" },
    },
    educationLevel: {
      type: Schema.Types.String,
      default: "",
      enum: ["High School Diploma", "Undergraduate", "Postgraduate", ""],
    },
    favBibleVerse: { type: Schema.Types.String, default: "" },
    bibleIdentification: { type: Schema.Types.String, default: "" },
  },
  {
    timestamps: true,
  }
);

const profileModel = model("Profile", profileSchema);

export default profileModel;
