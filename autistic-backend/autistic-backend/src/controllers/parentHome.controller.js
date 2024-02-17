import AuthModel from '../models/auth.model.js'
import DiagnosticModel from '../models/pre-diagnostic.model.js'
import ProfileModel from '../models/profile.model.js'
import CalendarModel from '../models/calendar.model.js'
import ChildModel from '../models/child.model.js'
import UserModel from '../models/users.model.js'
import ReviewModel from '../models/review.model.js'
import PolicyModel from '../models/policy.model.js'
import HelpAndFeedbackModel from '../models/helpAndFeedback.model.js'
import { generateToken } from '../services/jwt.js'
import { diagnosticFormValidator } from '../utils/validator/diagnosticValidator.util.js'
import {
  createChildValidator,
  createParentProfileValidator,
  createVisualValidator,
  updateChildValidator,
  updateParentProfileValidator,
} from '../utils/validator/authValidator.util.js'
import { uploadMedia } from '../utils/resources/imgResource.js'
import { checkMongooseId } from '../services/mongooseResource.js'
import CustomError from '../utils/responseHandlers/customError.util.js'
import CustomSuccess from '../utils/responseHandlers/customSuccess.util.js'
import { sendFeedbackEmail } from '../services/feedbackEmail.js'
import { sendFeedbackValidator } from '../utils/validator/sendFeedbackValidator.js'
import VisualModel from '../models/visual.model.js'
// import { Types } from 'mongoose'
// const maxAllowedErrors = 2

// @Desc: Role Parent Home
// @EndPoint: /api/get_all_professionals
// @Access: Private
export const getAllHealthProfessionals = async (req, res, next) => {
  try {
    if (req.userType === 'parent') {
      const profiles = await ProfileModel.find()
        .sort({ createdAt: -1 })
        .populate({
          path: 'image',
          select: 'mediaUrl mediaType',
        })
        .populate({
          path: 'userId',
          select: 'userType',
        })
        .populate({
          path: 'expertise',
          select: 'skill',
        })
        .exec()

      if (!profiles || profiles.length === 0) {
        return next(CustomError.notFound('No profiles found'))
      }

      const profileData = profiles.map((profile) => ({
        _id: profile._id,
        fullName: profile.fullName,
        image: profile.image,
        expertise: profile.expertise,
        userId: profile.userId,
        // location: profile.location,
        country: profile.country,
        city: profile.city,
        state: profile.state,
        description: profile.description,
        userType: profile.userId.userType,
      }))

      return next(
        CustomSuccess.createSuccess(profileData, 'Profile data fetched successfully', 200),
      )
    } else {
      return next(CustomError.forbidden('Access denied. Only parents can access this data.'))
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Get Health Professional Profile By Id
// @EndPoint: /api/get_consultant/:profileId
// @Access: Private
export const getHealthProfessionalProfileById = async (req, res, next) => {
  try {
    const { profileId } = req.params
    if (!checkMongooseId(profileId)) {
      return next(CustomError.badRequest('Invalid Id'))
    }

    const existUser = await ProfileModel.findOne({ userId: profileId })
    if (!existUser) {
      return next(CustomError.notFound('User not found'))
    }

    if (req.userType === 'parent') {
      const { profileId } = req.params
      const userProfile = await ProfileModel.findOne({ userId: profileId })

      if (!userProfile) {
        return next(CustomError.notFound('No user found'))
      }

      const authUser = await AuthModel.findOne({ userId: profileId })
      if (!authUser || !authUser.email) {
        return next(CustomError.notFound('User email not found'))
      }

      const payload = {
        _id: userProfile._id,
        name: userProfile.fullName,
        email: authUser.email,
        expertise: userProfile.expertise,
        location: userProfile.location,
        image: userProfile.image,
      }

      return next(CustomSuccess.createSuccess(payload, 'Profile data fetched successfully', 200))
    } else {
      return next(CustomError.forbidden('Access denied. Only parents can access this data.'))
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Get Health Professional Calendar By Id
// @EndPoint: /api/get_calendar/:calendarId
// @Access: Private
export const getHealthProfessionalCalendarById = async (req, res, next) => {
  try {
    const { calendarId } = req.params
    if (!checkMongooseId(calendarId)) {
      return next(CustomError.badRequest('Invalid Id'))
    }

    const calendar = await CalendarModel.findOne({ userId: calendarId })
    console.log(calendar, 'calendar')

    if (!calendar) {
      return next(CustomError.notFound('Calendar not found'))
    }

    if (req.userType === 'parent') {
      const authUser = await AuthModel.findOne({ userId: calendarId })
      if (!authUser || !authUser.email) {
        return next(CustomError.notFound('User email not found'))
      }

      return next(CustomSuccess.createSuccess(calendar, 'Calendar data fetched successfully', 200))
    } else {
      return next(CustomError.forbidden('Access denied. Only parents can access this data.'))
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Diagnostic Form
// @EndPoint: /api/diagnostic_form/
// @Access: Public
// export const diagnosticForm = async (req, res, next) => {
//   try {
//     const { userId } = req
//     const { profileId, calendarId } = req.query
//     if (!checkMongooseId(userId)) {
//       return next(CustomError.notFound('Invalid ID'))
//     }

//     const { error } = await diagnosticFormValidator.validateAsync(req.body)
//     if (error) {
//       return next(new CustomError(400, error.details[0].message))
//     }

//     const { patientName, dateOfBirth, age, gender, country, city, state } = req.body

//     if (!profileId || !calendarId) {
//       return next(
//         CustomError.badRequest('ProfileId and calendarId are required in query parameters'),
//       )
//     }

//     const userProfile = await ProfileModel.findById(profileId).exec()
//     const calendar = await CalendarModel.findById(calendarId).exec()

//     if (!userProfile || !calendar) {
//       return next(CustomError.notFound('Profile or Calendar not found'))
//     }

//     const createDiagnosticForm = await new DiagnosticModel({
//       userId,
//       profileId,
//       calendarId,
//       patientName,
//       dateOfBirth,
//       age,
//       gender,
//       country,
//       city,
//       state,
//       // location: {
//       //   type: 'Point',
//       //   coordinates: [Number(location.lat), Number(location.long)],
//       // },
//       status: 'pending',
//     }).save()

//     return next(
//       CustomSuccess.createSuccess(
//         createDiagnosticForm,
//         'Diagnostic Form created successfully',
//         201,
//       ),
//     )
//   } catch (error) {
//     if (error.code === 11000) {
//       return next(CustomError.createError('Duplicate keys not allowed', 409))
//     }
//     return next(CustomError.internal('Internal server error'))
//   }
// }

export const diagnosticForm = async (req, res, next) => {
  try {
    const { userId } = req
    // if (!checkMongooseId(userId)) {
    //   return next(CustomError.notFound('Invalid ID'))
    // }
    const { error } = await diagnosticFormValidator.validateAsync(req.body)
    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    const {
      patientName,
      dateOfBirth,
      age,
      gender,
      country,
      city,
      state,
      profileId,
      calendarId,
      childId,
    } = req.body

    const profile = await ProfileModel.findById(profileId).exec()
    const calendar = await CalendarModel.findById(calendarId).exec()
    const child = await ChildModel.findById(childId).exec()

    if (!profile || !calendar || !child) {
      return next(CustomError.notFound('Profile or Calendar or Child not found'))
    }

    const createDiagnosticForm = await new DiagnosticModel({
      userId,
      profileId,
      calendarId,
      childId,
      patientName,
      dateOfBirth,
      age,
      gender,
      country,
      city,
      state,
      status: 'pending',
    }).save()

    return next(
      CustomSuccess.createSuccess(
        createDiagnosticForm,
        'Diagnostic Form created successfully',
        201,
      ),
    )
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError('Duplicate keys not allowed', 409))
    }
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Create Parent Profile
// @EndPoint: /api/create_profile
// @Access: Private
export const createParentProfile = async (req, res, next) => {
  try {
    const { error } = await createParentProfileValidator.validateAsync(req.body)
    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    const { name, dateOfBirth, description, country, city, state } = req.body
    const { userId } = req

    const existingProfile = await UserModel.findOne({ userId })
    if (existingProfile) {
      return next(CustomError.createError('User already exists', 409))
    }

    if (!userId) {
      return next(CustomError.notFound('User not found', 404))
    }
    const image = req.file

    const profileImageUrl = await uploadMedia(image, 'image', userId, 'parent')

    req.body.image = profileImageUrl

    if (!req.body.image) {
      // return next(CustomSuccess.createSuccess('', 'Please Select Profile picture', 200))
      return next(CustomError.badRequest('Please Select Profile picture'))
    }

    const createParentProfile = await new UserModel({
      userId,
      name,
      dateOfBirth,
      description,
      country,
      city,
      state,
      image: profileImageUrl,
    }).save()

    await AuthModel.findOneAndUpdate({ _id: userId }, { isProfileCompleted: true }, { new: true })

    const authToken = await generateToken({
      _id: createParentProfile._id,
      tokenType: 'profile',
      deviceId: createParentProfile._id,
      userType: createParentProfile.userType,
      isTemporary: false,
    })
    console.log(authToken, 'authToken')

    const refreshToken = await generateToken({
      _id: createParentProfile._id,
      tokenType: 'refresh',
      deviceId: createParentProfile._id,
      isTemporary: false,
      userType: createParentProfile.userType,
    })

    const payload = {
      authToken,
      refreshToken,
    }

    // return next(
    //   CustomSuccess.createSuccess(createParentProfile, 'Profile creation successful', 200),
    // )
    return next(
      CustomSuccess.createSuccess(
        { ...createParentProfile._doc, ...payload },
        'Profile creation successful',
        200,
      ),
    )
  } catch (error) {
    // if (error.code === 11000) {
    //   return next(CustomError.createError('Duplicate keys not allowed', 409))
    // }
    return next(CustomError.createError(error.message, 400))
  }
}

export const updateParentProfile = async (req, res, next) => {
  try {
    const { userId } = req.query
    const { userType } = req
    if (!checkMongooseId(userId)) {
      return next(new CustomError('Invalid ID', 400))
    }

    const { error } = await updateParentProfileValidator.validateAsync(req.body)
    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    const { name, dateOfBirth, description, country, city, state } = req.body

    let user = await UserModel.findOne({ userId }).populate('image')
    if (!user) {
      return next(new CustomError('Parent not found', 404))
    }

    const image = req.file
    if (image) {
      const userImage = await uploadMedia(image, 'image', userId, userType)
      user.image = userImage
    }

    user.name = name || user.name
    user.dateOfBirth = dateOfBirth || user.dateOfBirth
    user.description = description || user.description
    user.country = country || user.country
    user.city = city || user.city
    user.state = state || user.state

    await user.save()

    user = await UserModel.findById(user._id).populate({
      path: 'image',
      select: 'mediaUrl -_id',
    })

    return next(CustomSuccess.createSuccess(user, 'Parent Profile updated successfully', 200))
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError('duplicate keys not allowed', 409))
    }
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Get Parent Profile By Id
// @EndPoint: /api/parent_profile/:userId
// @Access: Private

export const getParentProfileById = async (req, res, next) => {
  try {
    const { userId, userType } = req

    if (userType !== 'parent') {
      return next(CustomError.unauthorized('Only Parent can see their profile'))
    }

    const user = await UserModel.findOne({ userId })
      .populate({
        path: 'image',
        select: 'mediaUrl',
      })
      .populate({
        path: 'childrens',
        populate: {
          path: 'image',
          select: 'mediaUrl',
        },
      })

    if (!user) {
      return next(CustomError.notFound('Parent not found'))
    }

    return next(CustomSuccess.createSuccess(user, 'Profile fetched successfully', 200))
  } catch (error) {
    console.log(error.message)
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Get All Therapist Profiles
// @EndPoint: /api/therapist_profiles
// @Access: Private
export const getAllParentConsultations = async (req, res, next) => {
  try {
    const { userId, userType } = req
    if (userType !== 'parent') {
      return next(CustomError.createError('Unauthorized', 401))
    }

    const therapistProfile = await DiagnosticModel.find({ userId })
    if (therapistProfile.length === 0) {
      return next(CustomSuccess.createSuccess([], 'No diagnostic form', 200))
    }

    const userProfile = await ProfileModel.find({ profileId: therapistProfile.profileId }).populate(
      {
        path: 'image',
        select: 'mediaUrl mediaType',
      },
    )

    const payload = userProfile.map((profile) => {
      const { fullName, expertise, description, location, image } = profile
      return {
        fullName,
        expertise,
        description,
        location,
        image,
      }
    })

    return next(
      CustomSuccess.createSuccess(payload, 'Therapist profiles fetched successfully', 200),
    )
  } catch (error) {
    return next(CustomError.createError('Internal server error', 500))
  }
}

// @Desc: Get All Parents Schedules
// @EndPoint: /api/get_all_parents_schedules
// @Access: Private
export const getAllParentsSchedules = async (req, res, next) => {
  try {
    const { userId, userType } = req

    if (userType !== 'parent') {
      return next(CustomError.createError('Unauthorized', 401))
    }

    const therapistProfiles = await DiagnosticModel.find({ userId })

    if (therapistProfiles.length === 0) {
      return next(CustomSuccess.createSuccess([], 'No schedules found', 200))
    }

    const payload = therapistProfiles.map(async (therapistProfile) => {
      const { profileId, calendarId, status } = therapistProfile

      const userProfile = await ProfileModel.findById(profileId).populate({
        path: 'image',
        select: 'mediaUrl mediaType',
      })

      const userCalendar = await CalendarModel.findById(calendarId)

      const { fullName, expertise, image } = userProfile
      const { startTime, date } = userCalendar.selectedDates[0]

      return {
        fullName,
        expertise,
        image,
        startTime,
        date,
        status,
      }
    })

    const resolvedPayload = await Promise.all(payload)

    return next(CustomSuccess.createSuccess(resolvedPayload, 'Schedules fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError('Internal server error', 500))
  }
}

// @Desc: Search Professionals
// @EndPoint: /api/search_professionals
// @Access: Private
export const searchProfiles = async (req, res, next) => {
  try {
    const { expertType, profileName, city } = req.query
    const { userType } = req
    console.log(userType, 'userType')
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10

    if (userType !== 'parent') {
      return next(CustomError.forbidden('Only parents can search all professionals'))
    }

    let filter = {}

    if (expertType) {
      // Find userIds with matching userType from AuthModel
      const authUserIds = await AuthModel.find({
        userType: expertType,
      }).distinct('_id')

      filter.userId = { $in: authUserIds }
    }

    let textSearchQuery = {}

    if (profileName) {
      textSearchQuery.fullName = { $regex: profileName, $options: 'i' }
    }

    if (city) {
      textSearchQuery.city = { $regex: city, $options: 'i' }
    }

    // const totalCount = await ProfileModel.countDocuments({
    //   $and: [filter, textSearchQuery],
    // })

    const profiles = await ProfileModel.find({
      $and: [filter, textSearchQuery],
    })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate({
        path: 'image',
        select: 'mediaUrl mediaType',
      })

    if (profiles.length === 0) {
      return next(CustomSuccess.createSuccess([], 'No profiles found', 200))
    }

    const payload = profiles.map((profile) => {
      const { fullName, userType, description, location, image, expertise, country, city, state } =
        profile
      return {
        fullName,
        // userType,
        description,
        location,
        image,
        expertise,
        country,
        city,
        state,
      }
    })

    // const totalPages = Math.ceil(totalCount / pageSize)

    return next(
      CustomSuccess.createSuccess(
        {
          data: payload,
          // totalPages,
          // currentPage: page,
          // pageSize: pageSize,
          // totalCount,
        },
        'Profiles found successfully',
        200,
      ),
    )
  } catch (error) {
    return next(CustomError.createError('Internal server error', 500))
  }
}
// export const searchProfiles = async (req, res, next) => {
//   try {
//     const { userType, profileName, expertise, page = 1, pageSize = 10 } = req.query

//     let filter = {}

//     if (userType) {
//       filter.userType = userType
//     }

//     if (expertise) {
//       filter.expertise = { $in: expertise.split(',') }
//     }

//     let textSearchQuery = {}

//     if (profileName) {
//       textSearchQuery.fullName = { $regex: profileName, $options: 'i' }
//     }

//     const totalCount = await ProfileModel.countDocuments({
//       $and: [filter, textSearchQuery],
//     })

//     const profiles = await ProfileModel.find({
//       $and: [filter, textSearchQuery],
//     })
//       .skip((page - 1) * pageSize)
//       .limit(pageSize)
//       .populate({
//         path: 'image',
//         select: 'mediaUrl mediaType',
//       })

//     if (profiles.length === 0) {
//       return next(CustomSuccess.createSuccess([], 'No profiles found', 200))
//     }

//     const payload = profiles.map((profile) => {
//       const { fullName, userType, description, location, image } = profile
//       return {
//         fullName,
//         userType,
//         description,
//         location,
//         image,
//       }
//     })

//     const totalPages = Math.ceil(totalCount / pageSize)

//     return next(
//       CustomSuccess.createSuccess(
//         {
//           data: payload,
//           totalPages,
//           currentPage: page,
//           pageSize: pageSize,
//           totalCount,
//         },
//         'Profiles found successfully',
//         200,
//       ),
//     )
//   } catch (error) {
//     console.log(error.message)
//     return next(CustomError.createError('Internal server error', 500))
//   }
// }

// @Desc: Create Review
// @EndPoint: /api/create_review
// @Access: Private
export const createReview = async (req, res, next) => {
  try {
    const { profileId, rating, comment } = req.body
    const { userId } = req

    if (!profileId) {
      throw new CustomError('Please provide a profile ID', 400)
    }
    if (!rating || rating < 1 || rating > 5) {
      throw new CustomError('Please provide a valid rating between 1 and 5', 400)
    }
    if (!comment) {
      throw new CustomError('Please provide a comment', 400)
    }

    const profile = await ProfileModel.findOne({ _id: profileId }).lean()

    if (!profile) {
      throw new CustomError('Profile not found', 404)
    }

    const existingReview = await ReviewModel.findOne({
      profileId,
      userId,
    }).lean()

    if (existingReview) {
      throw new CustomError('You have already reviewed this profile', 400)
    }

    const review = new ReviewModel({
      profileId,
      rating,
      comment,
      userId,
    })

    await review.save()

    profile.reviews.push(review._id)

    await ProfileModel.findOneAndUpdate({ _id: profileId }, { reviews: profile.reviews }).exec()

    return next(
      CustomSuccess.createSuccess(
        {
          message: 'Please give autism team up to 48 hours to review your request',
          reviewId: review._id,
        },
        'Review created successfully',
        201,
      ),
    )
  } catch (error) {
    return next(CustomError.internal(error.message))
  }
}

export const getAbout = async (req, res, next) => {
  try {
    const { userType } = req

    if (userType !== 'parent') {
      return next(CustomError.createError('Only parent can see about info', 403))
    }

    const about = await PolicyModel.findOne({ type: 'about' })

    return next(CustomSuccess.createSuccess(about, 'About app fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const getTerms = async (req, res, next) => {
  try {
    const { userType } = req

    if (userType !== 'parent') {
      return next(CustomError.createError('Only parent can see terms & conditions', 403))
    }

    const terms = await PolicyModel.findOne({ type: 'terms' })

    return next(
      CustomSuccess.createSuccess(terms, 'Terms and conditions fetched successfully', 200),
    )
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const getPolicy = async (req, res, next) => {
  try {
    const { userType } = req

    if (userType !== 'parent') {
      return next(CustomError.createError('Only parent can see privacy policy', 403))
    }

    const privacy = await PolicyModel.findOne({ type: 'privacy' })

    return next(CustomSuccess.createSuccess(privacy, 'Privacy policy fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const sendFeedback = async (req, res, next) => {
  try {
    const { userId, userType } = req
    const { name, subject, email, message } = req.body

    const { error } = await sendFeedbackValidator.validateAsync(req.body)

    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    if (!userId) {
      return next(CustomError.notFound('User not found'))
    }

    if (userType !== 'parent') {
      return next(CustomError.notFound('Only parent can send feedback'))
    }

    const objectImages = req.files['image']

    if (!objectImages) {
      return next(CustomError.createError('Image is not allowed to be empty', 400))
    }

    const attachmentsArray = []
    const imageIds = []

    for (let i = 0; i < objectImages.length; i++) {
      const image = objectImages[i]
      attachmentsArray.push({
        filename: image.filename,
        filePath: image.path,
      })

      const imageId = await uploadMedia(image.path, 'image', userId, userType)
      imageIds.push(imageId)
    }

    req.body.image = imageIds

    const sendFeedback = new HelpAndFeedbackModel({
      userId,
      name,
      subject,
      email,
      message,
      image: imageIds,
    })

    await sendFeedback.save()

    const data = {
      name,
      subject,
      email,
      message,
      image: imageIds,
    }

    const to = process.env.ADMIN_EMAIL
    const headline = 'Report or Issue From User'

    const html = `
      <html>
      <head>Report or Issue From User</head>
        <body>
          <h1>${headline}</h1>
          <h1>${name}</h1>
          <h1>${message}</h1>
          <h4>A User reported an Issue on Plumb-Safe App</h4>
        </body>
      </html>
      `

    sendFeedbackEmail(to, headline, html, attachmentsArray, data.email)

    return next(CustomSuccess.createSuccess(sendFeedback, 'Feedback sent successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// export const createChildren = async (req, res, next) => {
//   try {
//     const { error } = await createChildValidator.validateAsync(req.body)
//     if (error) {
//       return next(new CustomError(400, error.details[0].message))
//     }

//     const { userId, userType } = req

//     if (!userId) {
//       return next(CustomError.notFound('User not found', 404))
//     }

//     if (userType !== 'parent') {
//       return next(CustomError.forbidden('Only parent can create chilren'))
//     }

//     const parentProfile = await UserModel.findOne({ userId })

//     if (!parentProfile) {
//       return next(
//         CustomError.forbidden('You cannot create children without creating a parent profile'),
//       )
//     }

//     const image = req.file

//     const childImageUrl = await uploadMedia(image, 'image', userId, 'parent')

//     req.body.image = childImageUrl

//     if (!req.body.image) {
//       return next(CustomError.badRequest('Please Select Profile picture'))
//     }

//     const { fullName, dateOfBirth, gender } = req.body

//     const createChild = await new ChildModel({
//       userId,
//       fullName,
//       dateOfBirth,
//       gender,
//       image: childImageUrl,
//     }).save()

//     await UserModel.updateOne({ userId }, { $push: { childrens: createChild._id } })

//     await UserModel.populate(createChild, { path: 'image', select: '-_id mediaUrl' })

//     return next(CustomSuccess.createSuccess(createChild, 'Children created successfully', 200))
//   } catch (error) {
//     console.error(error.message)
//     return next(CustomError.createError(error.message, 400))
//   }
// }

export const createChildren = async (req, res, next) => {
  try {
    const { error } = await createChildValidator.validateAsync(req.body)
    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    const { userId, userType } = req

    if (!userId) {
      return next(CustomError.notFound('User not found', 404))
    }

    if (userType !== 'parent') {
      return next(CustomError.forbidden('Only parent can create chilren'))
    }

    const parentProfile = await UserModel.findOne({ userId })

    if (!parentProfile) {
      return next(
        CustomError.forbidden('You cannot create children without creating a parent profile'),
      )
    }

    const image = req.file

    const childImageUrl = await uploadMedia(image, 'image', userId, 'parent')

    req.body.image = childImageUrl

    if (!req.body.image) {
      return next(CustomError.badRequest('Please Select Profile picture'))
    }

    const { fullName, dateOfBirth, gender } = req.body

    const createChild = await new ChildModel({
      userId,
      fullName,
      dateOfBirth,
      gender,
      image: childImageUrl,
    }).save()

    await UserModel.updateOne({ userId }, { $push: { childrens: createChild._id } })

    // const userData = await UserModel.findOne({ userId }).populate({
    //   path: 'image',
    //   select: 'mediaUrl -_id',
    // }).populate({
    //   path: 'userId',
    //   select: 'email userType'
    // }).select('country city state')

    // await ChildModel.populate(createChild, {
    //     path: 'image',
    //     select: 'mediaUrl',
    // });

    // const populatedProfile = await UserModel.populate(createParentProfile, {
    //   path: 'userId',
    //   select: '_id email',
    // })

    // const populatedImage = await UserModel.populate(createParentProfile, {
    //   path: 'image',
    //   select: 'mediaUrl',
    // })

    // const responsePayload = {
    //   ...populatedProfile._doc,
    //   userId: populatedProfile.userId._id,
    //   email: populatedProfile.userId.email,
    //   image: { mediaUrl: populatedImage.image.mediaUrl },
    //   ...payload,
    // }

    const childInfo = await ChildModel.find({ userId }).populate({
      path: 'image',
      select: 'mediaUrl -_id',
    })

    if (!childInfo || childInfo === 0) {
      return next(CustomError.notFound('Empty child data'))
    }

    return next(
      CustomSuccess.createSuccess(
        { ...createChild._doc, childInfo },
        'Children created successfully',
        200,
      ),
    )
  } catch (error) {
    console.error(error.message)
    return next(CustomError.createError(error.message, 400))
  }
}

export const updateChildren = async (req, res, next) => {
  try {
    const { userId, userType } = req

    if (!userId) {
      return next(CustomError.notFound('User not found', 404))
    }

    if (userType !== 'parent') {
      return next(CustomError.forbidden('Only parent can create chilren'))
    }

    const { childId } = req.query
    if (!checkMongooseId(childId)) {
      return next(CustomError.badRequest('Invalid childId'))
    }

    const { fullName, dateOfBirth, gender } = req.body

    const { error } = await updateChildValidator.validateAsync(req.body)
    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    const image = req.file
    const childImageUrl = await uploadMedia(image, 'image', userId, 'parent')
    req.body.image = childImageUrl
    if (!req.body.image) {
      return next(CustomError.badRequest('Please Select Profile picture'))
    }

    let child = await ChildModel.findOne({ _id: childId, userId })

    child.fullName = fullName || child.fullName
    child.dateOfBirth = dateOfBirth || child.dateOfBirth
    child.gender = gender || child.gender

    await child.save()

    child = await ChildModel.findById(child._id).populate({
      path: 'image',
      select: 'mediaUrl -_id',
    })

    return next(CustomSuccess.createSuccess(child, 'Child updated successfully', 200))
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError('duplicate keys not allowed', 409))
    }
    return next(CustomError.createError(error.message, 400))
  }
}

export const createVisual = async (req, res, next) => {
  try {
    const { error } = await createVisualValidator.validateAsync(req.body)
    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    const { userId, userType } = req

    if (!userId) {
      return next(CustomError.notFound('User not found', 404))
    }

    if (userType !== 'parent') {
      return next(CustomError.forbidden('Only parent can create visual'))
    }

    const { day, time, action, description } = req.body

    const createVisual = await new VisualModel({
      userId,
      day,
      time,
      action,
      description,
    }).save()

    return next(CustomSuccess.createSuccess(createVisual, 'Visual created successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// export const createVisual = async (req, res, next) => {
//   try {
//     const { error } = await createVisualValidator.validateAsync(req.body)
//     if (error) {
//       return next(new CustomError(400, error.details[0].message))
//     }

//     const { userId, userType } = req

//     if (!userId) {
//       return next(CustomError.notFound('User not found', 404))
//     }

//     if (userType !== 'parent') {
//       return next(CustomError.forbidden('Only parent can create visual'))
//     }

//     const { visuals } = req.body

//     const visualEntries = visuals.map((entry) => ({
//       userId,
//       day: entry.day,
//       time: entry.time,
//       action: entry.action,
//       description: entry.description,
//     }))

//     await VisualModel.insertMany(visualEntries)

//     await VisualModel.populate(visualEntries, {
//       path: 'action',
//       select: 'image action',
//       populate: { path: 'image', select: 'mediaUrl -_id' },
//     })

//     if (visuals.length === 0) {
//       return next(CustomError.badRequest('Visuals data is required'))
//     }

//     // const createdVisuals = await VisualModel.insertMany(
//     //   visuals.map((visual) => ({ userId, ...visual })),
//     // )

//     return next(CustomSuccess.createSuccess(visualEntries, 'Visuals created successfully', 200))
//   } catch (error) {
//     return next(CustomError.createError(error.message, 400))
//   }
// }

// export const createVisual = async (req, res, next) => {
//   try {
//     const { error } = await createVisualValidator.validateAsync(req.body)
//     if (error) {
//       return next(new CustomError(400, error.details[0].message))
//     }

//     const { userId, userType } = req

//     if (!userId) {
//       return next(CustomError.notFound('User not found', 404))
//     }

//     if (userType !== 'parent') {
//       return next(CustomError.forbidden('Only parent can create visual'))
//     }

//     const { visuals } = req.body

//     const visualEntries = visuals.map((entry) => ({
//       userId,
//       day: entry.day,
//       time: entry.time,
//       action: entry.action,
//       description: entry.description,
//     }))

//     const createdVisuals = await VisualModel.insertMany(visualEntries)

//     const populatedVisuals = await VisualModel.populate(createdVisuals, {
//       path: 'action',
//       select: 'image action',
//       populate: { path: 'image', select: 'mediaUrl -_id' },
//     })

//     if (visuals.length === 0) {
//       return next(CustomError.badRequest('Visuals data is required'))
//     }

//     return next(CustomSuccess.createSuccess(populatedVisuals, 'Visuals created successfully', 200))
//   } catch (error) {
//     return next(CustomError.createError(error.message, 400))
//   }
// }

export const myVisuals = async (req, res, next) => {
  try {
    const { userId, userType } = req

    if (!userId) {
      return next(CustomError.notFound('User not found', 404))
    }

    if (userType !== 'parent') {
      return next(CustomError.forbidden('Only parent can see visuals'))
    }

    const visuals = await VisualModel.find({ userId }).populate({
      path: 'action',
      select: 'image action',
      populate: { path: 'image', select: 'mediaUrl -_id' },
    })

    if (visuals.length === 0) {
      return next(CustomSuccess.createSuccess({}, 'Visuals are empty', 200))
    }
    return next(CustomSuccess.createSuccess(visuals, 'Visuals fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// export const updateVisual = async (req, res, next) => {
//   try {
//     const { error } = await updateVisualValidator.validateAsync(req.body)
//     if (error) {
//       return next(new CustomError(400, error.details[0].message))
//     }

//     const { userId, userType } = req

//     if (!userId) {
//       return next(CustomError.notFound('User not found', 404))
//     }

//     if (userType !== 'parent') {
//       return next(CustomError.forbidden('Only parent can update visual'))
//     }

//     const { visuals } = req.body

//     if (visuals.length === 0) {
//       return next(CustomError.badRequest('Visuals data is required'))
//     }

//     const visualUpdates = visuals.map(async (entry) => {
//       const { day, time, action, description } = entry
//       const updateObj = { userId, day, time, action, description }
//       const updatedVisual = await VisualModel.findOneAndUpdate(
//         { _id: entry.id }, // Assuming each visual has an id for identification
//         updateObj,
//         { new: true, upsert: true },
//       )
//         .populate('action', 'image action')
//         .populate({ path: 'action', select: 'mediaUrl -_id' })
//       return updatedVisual
//     })

//     const updatedVisuals = await Promise.all(visualUpdates)

//     return next(CustomSuccess.createSuccess(updatedVisuals, 'Visuals updated successfully', 200))
//   } catch (error) {
//     return next(CustomError.createError(error.message, 400))
//   }
// }
