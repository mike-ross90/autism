import { checkMongooseId } from '../services/mongooseResource.js'
import { uploadMedia } from '../utils/resources/imgResource.js'
import {
  createProfileValidator,
  updateExpertProfileValidator,
} from '../utils/validator/authValidator.util.js'
import { calendarValidator } from '../utils/validator/calendarValidator.js'
import ProfileModel from '../models/profile.model.js'
import AuthModel from '../models/auth.model.js'
import CalendarModel from '../models/calendar.model.js'
import CustomSuccess from '../utils/responseHandlers/customSuccess.util.js'
import CustomError from '../utils/responseHandlers/customError.util.js'
import DiagnosticModel from '../models/pre-diagnostic.model.js'
import ReviewModel from '../models/review.model.js'
import ExpertiseModel from '../models/expertise.model.js'
import PolicyModel from '../models/policy.model.js'
import HelpAndFeedbackModel from '../models/helpAndFeedback.model.js'
import { sendFeedbackEmail } from '../services/feedbackEmail.js'
import { sendFeedbackValidator } from '../utils/validator/sendFeedbackValidator.js'
import UserModel from '../models/users.model.js'

// @Desc: Add therapist profile
// @EndPoint: /api/add_profile
// @Access: Public
export const addTherapistProfile = async (req, res, next) => {
  try {
    const { error } = await createProfileValidator.validateAsync(req.body)
    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    const { name, contactNo, expertise, country, city, state, description, dateOfBirth } = req.body
    const { userId, userType } = req

    const existingProfile = await ProfileModel.findOne({ userId })
    if (existingProfile) {
      return next(CustomError.createError('Profile already exists', 409))
    }

    // const expertise = req.body.expertise

    if (!Array.isArray(expertise) || expertise.length === 0) {
      return next(CustomError.badRequest('Expertise IDs are required'))
    }

    // if (!checkMongooseId(expertise)) {
    //   return next(CustomError.badRequest('Expertise Invalid Id '))
    // }

    if (!userId) {
      return next(CustomError.notFound('User not found', 404))
    }
    const image = req.file

    const profileImageUrl = await uploadMedia(image, 'image', userId, userType)

    req.body.image = profileImageUrl

    if (!req.body.image) {
      // return next(CustomSuccess.createSuccess('', 'Please Select Profile picture', 200))
      return next(CustomError.badRequest('Please Select Profile picture'))
    }

    const createProfile = await new ProfileModel({
      userId,
      name,
      contactNo,
      country,
      city,
      state,
      dateOfBirth,
      description,
      expertise: [...expertise],
      // expertise
      // location: {
      //   type: 'Point',
      //   coordinates: [Number(location.lat), Number(location.long)],
      // },
      image: profileImageUrl,
    }).save()

    await AuthModel.findOneAndUpdate({ _id: userId }, { isProfileCompleted: true }, { new: true })

    return next(CustomSuccess.createSuccess(createProfile, 'Profile creation successful', 200))
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError('Duplicate keys not allowed', 409))
    }
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Update Therapist Profile
// @EndPoint: /api/update-profile/:userId
// @Access: Public
export const updateTherapistProfile = async (req, res, next) => {
  try {
    const { userId } = req.params
    const { userType } = req
    if (!checkMongooseId(userId)) {
      return next(new CustomError('Invalid ID', 400))
    }

    const { error } = await updateExpertProfileValidator.validateAsync(req.body)
    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    const { fullName, contactNo, expertise, country, city, state, description, dateOfBirth } =
      req.body

    if (!checkMongooseId(expertise)) {
      return next(CustomError.badRequest('Expertise Invalid Id '))
    }

    let user = await ProfileModel.findOne({ userId }).populate('image')
    if (!user) {
      return next(new CustomError('User not found', 404))
    }

    const image = req.file
    if (image) {
      const profileImage = await uploadMedia(image, 'image', userId, userType)
      user.image = profileImage
    }

    user.fullName = fullName || user.fullName
    user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth
    user.description = description || user.description
    user.contactNo = contactNo || user.contactNo
    user.expertise = expertise || user.expertise
    // if (location && location.lat && location.long) {
    //   user.location = {
    //     type: 'Point',
    //     coordinates: [Number(location.long), Number(location.lat)],
    //   }
    // }
    user.country = country || user.country
    user.city = city || user.city
    user.state = state || user.state

    await user.save()

    user = await ProfileModel.findById(user._id).populate('image')

    const payload = {
      _id: user._id,
      name: user.fullName,
      dateOfBirth: user.dateOfBirth,
      description: user.description,
      contactNo: user.contactNo,
      expertise: user.expertise,
      image: {
        mediaUrl: user.image.mediaUrl,
        mediaType: user.image.mediaType,
      },
      country: user.country,
      city: user.city,
      state: user.state,

      // location: user.location,
    }
    return next(CustomSuccess.createSuccess(payload, 'Profile updated successfully', 200))
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError('duplicate keys not allowed', 409))
    }
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Add therapist profile
// @EndPoint: /api/calendar_select
// @Access: Public
export const selectTherapistDates = async (req, res, next) => {
  try {
    const { userType, userId } = req
    if (userType === 'admin') {
      return next(CustomError.createError('Only experts can update the calendar', 403))
    }

    const { cal } = req.body

    const calendarEntries = cal.map((entry) => ({
      userId,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      status: entry.status,
    }))

    await CalendarModel.insertMany(calendarEntries)

    return next(
      CustomSuccess.createSuccess(calendarEntries, 'Calendar entries created successfully', 201),
    )
  } catch (error) {
    return next(CustomError.createError(error.message, 500))
  }
}

// @Desc: Update therapist calendar
// Endpoint: /therapist/calendar/:_id
// Access: Private
export const updateTherapistTiming = async (req, res, next) => {
  try {
    // const { error } = await calendarValidator.validateAsync(req.body)
    // if (error) {
    //   return next(new CustomError(400, error.details[0].message))
    // }

    const { userId, userType } = req
    const allowedUserTypes = ['therapist', 'dietitian', 'pediatrician', 'counselor']

    if (!userId) {
      return next(CustomError.createError('User not found', 404))
    }

    if (!allowedUserTypes.includes(userType)) {
      return next(CustomError.createError('Only experts can update their calendars', 403))
    }

    const updatedCalendars = []

    for (const updateData of req.body) {
      const { _id, day, startTime, endTime, status } = updateData

      const calendar = await CalendarModel.findOneAndUpdate(
        { _id, userId },
        { day, startTime, endTime, status },
        { new: true },
      ).exec()

      if (!calendar) {
        return next(CustomError.createError('Calendar not found', 404))
      }

      updatedCalendars.push(calendar)
    }

    return next(
      CustomSuccess.createSuccess(updatedCalendars, 'Calendars updated successfully', 200),
    )
  } catch (error) {
    console.log(error.message)
    return next(CustomError.createError(error.message, 500))
  }
}

// @Desc: Get all the consultations of a therapist
// @Route: GET api/profile/consultations
// @Access: Private
// export const getAllMyConsultations = async (req, res, next) => {
//   try {
//     const { userId, userType } = req
//     if (userType === 'admin' && userType === 'parent') {
//       return next(CustomError.createError('Only experts can see consultations', 403))
//     }
//     const userProfile = await ProfileModel.findOne({ userId }).populate({
//       path: 'image',
//       select: 'mediaUrl mediaType',
//     })
//     if (!userProfile) {
//       return next(CustomError.createError('Profile not found for the user', 404))
//     }

//     const diagonasticData = await DiagnosticModel.find({
//       profileId: userProfile._id,
//     }).populate('calendarId')

//     if (diagonasticData.length === 0) {
//       return next(CustomSuccess.createSuccess([], 'No data found', 200))
//     }

//     const payload = diagonasticData.map((item) => {
//       return {
//         patientName: item.patientName,
//         location: item.location,
//         status: item.status,
//         image: userProfile.image,
//         // datesAndTimes: item.calendarId?.selectedDates.map((date) => ({
//         //   date: date.date,
//         //   startTime: date.startTime,
//         // })),
//       }
//     })

//     return next(CustomSuccess.createSuccess(payload, 'Consultations fetched successfully', 200))
//   } catch (error) {
//     return next(CustomError.createError(error.message, 400))
//   }
// }

// export const getAllMyConsultations = async (req, res, next) => {
//   try {
//     const { userId, userType } = req
//     if (userType === 'parent' && userType === 'admin') {
//       return next(CustomError.forbidden('Only experts can see all of this consultations'))
//     }

//     const expertProfile = await ProfileModel.findOne({ userId })
//     if (!expertProfile) {
//       return next(CustomError.createError('Profile not found for the user', 404))
//     }

//     const findParent = await DiagnosticModel.find({ profileId: expertProfile._id })
//       .populate('calendarId')
//       .populate({
//         path: 'childId',
//         select: 'fullName dateOfBirth gender',
//       })
//     if (findParent.length === 0) {
//       return next(CustomSuccess.createSuccess([], 'No Consultations found', 200))
//     }

//     return next(
//       CustomSuccess.createSuccess(findParent, 'My Consultations fetched successfully', 200),
//     )
//   } catch (error) {
//     return next(CustomError.createError(error.message, 400))
//   }
// }

export const getAllMyConsultations = async (req, res, next) => {
  try {
    const { userId, userType } = req
    if (userType === 'parent' || userType === 'admin') {
      return next(CustomError.forbidden('Only experts can see all of these consultations'))
    }

    const expertProfile = await ProfileModel.findOne({ userId })
    if (!expertProfile) {
      return next(CustomError.createError('Profile not found for the user', 404))
    }

    const findParent = await DiagnosticModel.aggregate([
      {
        $match: { profileId: expertProfile._id },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'userId',
          as: 'userData',
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'media',
          localField: 'userData.image',
          foreignField: '_id',
          as: 'imageData',
        },
      },
      {
        $unwind: {
          path: '$imageData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'calendars',
          localField: 'calendarId',
          foreignField: '_id',
          as: 'calendarData',
        },
      },
      {
        $unwind: {
          path: '$calendarData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'children',
          localField: 'childId',
          foreignField: '_id',
          as: 'childData',
        },
      },
      {
        $unwind: {
          path: '$childData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          country: 1,
          city: 1,
          state: 1,
          status: 1,
          patientName: 1,
          userId: 1,
          // profileId: 1,
          // calendarId: 1,
          // childId: 1,
          userData: '$imageData.mediaUrl',
          calendarData: 1,
          childData: 1,
          // 'userData.image': '$imageData',
          // userData: '$imageData',
        },
      },
    ])

    if (findParent.length === 0) {
      return next(CustomSuccess.createSuccess([], 'No Consultations found', 200))
    }

    return next(
      CustomSuccess.createSuccess(findParent, 'My Consultations fetched successfully', 200),
    )
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Update Diagnostic Status
// @Route: GET api/profile/consultation_status
// @Access: Private
export const updateDiagnosticStatus = async (req, res, next) => {
  try {
    const { userType } = req
    if (userType !== 'therapist') {
      return next(CustomError.createError('Only therapists can update status', 403))
    }
    const { id, status } = req.query
    if (!checkMongooseId(id)) {
      return next(CustomError.createError('Invalid ID', 400))
    }

    const statusBoolean = status === 'true'

    const diagnosticForm = await DiagnosticModel.findById(id).exec()

    if (!diagnosticForm) {
      return next(CustomError.createError('Diagnostic form not found', 404))
    }

    diagnosticForm.status = statusBoolean ? 'confirmed' : 'cancelled'
    await diagnosticForm.save()

    return next(CustomSuccess.createSuccess({}, 'Status updated successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 500))
  }
}

export const getAllMyCalendars = async (req, res, next) => {
  try {
    const { userType, userId } = req

    if (userType === 'admin' || userType === 'parent') {
      return next(CustomError.createError('Only experts can see consultations', 403))
    }

    if (!userId) {
      return next(CustomError.createError('User not found', 404))
    }

    const calendars = await CalendarModel.find({ userId })

    if (!calendars || calendars.length === 0) {
      return next(CustomError.createError('Calendar are empty', 404))
    }

    calendars.sort((a, b) => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      return days.indexOf(a.day) - days.indexOf(b.day)
    })

    return next(CustomSuccess.createSuccess(calendars, 'Calendars fetched successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Get Therapist Profile By Id
// @Route: GET api/profile/therapist_profile/:userId
// @Access: Private
export const getTherapistProfileById = async (req, res, next) => {
  try {
    const { userId: requestedUserId } = req.params
    const { userId: authenticatedUserId } = req

    const { userType } = req
    if (userType === 'parent') {
      return next(CustomError.createError('Only experts can see their profile', 403))
    }

    if (!checkMongooseId(requestedUserId)) {
      return next(CustomError.notFound('Invalid ID'))
    }

    if (requestedUserId !== authenticatedUserId) {
      return next(CustomError.forbidden('You are not authorized to view this profile'))
    }

    const therapistUser = await ProfileModel.findOne({ userId: requestedUserId }).populate([
      {
        path: 'reviews',
        select: 'rating comment userId -_id',
        populate: {
          path: 'userId',
          select: 'familyName image -_id',
        },
      },
      {
        path: 'expertise',
        select: 'skill -_id',
      },
      {
        path: 'image',
        select: 'mediaUrl -_id',
      },
    ])

    console.log(therapistUser, 'therapistUser')

    if (!therapistUser) {
      return next(CustomError.notFound('Therapist user not found'))
    }

    const payload = {
      _id: therapistUser._id,
      fullName: therapistUser.fullName,
      description: therapistUser.description,
      dateOfBirth: therapistUser.dateOfBirth,
      image: therapistUser.image ? therapistUser.image.mediaUrl : null,
      country: therapistUser.country,
      city: therapistUser.city,
      state: therapistUser.state,
      // location: therapistUser.location,
      reviews: therapistUser.reviews,
      expertise: therapistUser.expertise,
    }

    return next(
      CustomSuccess.createSuccess(payload, 'Therapist user profile fetched successfully', 200),
    )
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Get All Therapist Reviews
// @Route: GET api/profile/therapist_all_reviews
// @Access: Private
export const getAllTherapistReviews = async (req, res, next) => {
  try {
    const { userType, userId } = req
    if (userType === 'admin') {
      return next(CustomError.createError('Only experts can see their reviews', 403))
    }

    const profileReview = await ProfileModel.findOne({ userId }).populate({
      path: 'reviews',
      populate: {
        path: 'userId',
        select: 'familyName image -_id',
      },
    })

    if (!profileReview) {
      return next(CustomError.notFound('Reviews not found'))
    }

    const payload = profileReview.reviews.map((item) => {
      return {
        rating: item.rating,
        comment: item.comment,
        user: {
          familyName: item.userId.familyName,
          image: item.userId.image,
        },
      }
    })

    return next(CustomSuccess.createSuccess(payload, 'Therapist reviews fetched successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Get Review By Review Id
// @Route: GET api/profile/get_reviews/:reviewId
// @Access: Private
export const getReviewsByReviewId = async (req, res, next) => {
  try {
    const { reviewId } = req.params
    if (!checkMongooseId(reviewId)) {
      return next(CustomError.notFound('Invalid ID'))
    }

    const review = await ReviewModel.findOne({ _id: reviewId })
    if (!review) {
      return next(CustomError.notFound('Review not found'))
    }

    return next(CustomSuccess.createSuccess(review, 'Review fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 500))
  }
}

// @Desc: Confirm Diagnostic Form
// @Route: GET api/profile/confirm-diagnostic/:formId
// @Access: Private
export const confirmDiagnosticForm = async (req, res, next) => {
  try {
    const { userId } = req
    const { formId } = req.query

    if (!checkMongooseId(formId)) {
      return next(CustomError.notFound('Invalid Form ID'))
    }

    const diagnosticForm = await DiagnosticModel.findById(formId).exec()
    if (!diagnosticForm) {
      return next(CustomError.notFound('Diagnostic Form not found'))
    }

    const userProfile = await ProfileModel.findOne({ _id: diagnosticForm.profileId }).exec()
    const userCalendar = await CalendarModel.findOne({ _id: diagnosticForm.calendarId }).exec()

    if (!userProfile || !userCalendar) {
      return next(CustomError.notFound('Profile or Calendar not found'))
    }

    if (userProfile.userId.toString() !== userId || userCalendar.userId.toString() !== userId) {
      return next(CustomError.forbidden('Access denied'))
    }

    diagnosticForm.status = 'confirmed'
    diagnosticForm.isAccepted = true
    await diagnosticForm.save()

    return next(
      CustomSuccess.createSuccess(
        diagnosticForm,
        'Diagnostic Form status updated to confirmed',
        200,
      ),
    )
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

export const addSkill = async (req, res, next) => {
  try {
    const { userId } = req
    // if (!userId) {
    //   return next(CustomError.notFound('User id not found'))
    // }

    if (!checkMongooseId(userId)) {
      return next(CustomError.badRequest('Invalid user id'))
    }

    const { skillId } = req.body
    if (!checkMongooseId(skillId)) {
      return next(CustomError.badRequest('Invalid skill id'))
    }

    const skillExists = await ExpertiseModel.exists({ _id: skillId })
    if (!skillExists) {
      return next(CustomError.notFound('Skill not found'))
    }

    const userHasSkill = await ProfileModel.exists({ userId, expertise: skillId })

    if (userHasSkill) {
      const updatedProfile = await ProfileModel.findOneAndUpdate(
        { userId },
        { $pull: { expertise: skillId } },
        { new: true },
      )

      if (!updatedProfile) {
        return next(CustomError.notFound('User profile not found'))
      }
      return next(CustomSuccess.createSuccess({}, 'Skill removed successfully', 200))
    } else {
      const updatedProfile = await ProfileModel.findOneAndUpdate(
        { userId },
        { $addToSet: { expertise: skillId } },
        { new: true },
      )

      if (!updatedProfile) {
        return next(CustomError.notFound('User profile not found'))
      }
      return next(CustomSuccess.createSuccess({}, 'Skill added successfully', 200))
    }
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

export const getAbout = async (req, res, next) => {
  try {
    const { userType } = req
    const allowedUserTypes = ['therapist', 'dietitian', 'pediatrician', 'counselor']

    if (!allowedUserTypes.includes(userType)) {
      return next(CustomError.createError('Only experts can see about app', 403))
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
    const allowedUserTypes = ['therapist', 'dietitian', 'pediatrician', 'counselor']

    if (!allowedUserTypes.includes(userType)) {
      return next(CustomError.createError('Only experts can see terms & conditions', 403))
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
    const allowedUserTypes = ['therapist', 'dietitian', 'pediatrician', 'counselor']

    if (!allowedUserTypes.includes(userType)) {
      return next(CustomError.createError('Only experts can see privacy policy', 403))
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

    const allowedUserTypes = ['therapist', 'dietitian', 'pediatrician', 'counselor']

    if (userType !== allowedUserTypes) {
      return next(CustomError.notFound('Only experts can send feedback'))
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
