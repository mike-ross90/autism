import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import CustomError from '../utils/responseHandlers/customError.util.js'
import CustomSuccess from '../utils/responseHandlers/customSuccess.util.js'
import AuthModel from '../models/auth.model.js'
import DeviceModel from '../models/device.model.js'
import OtpModel from '../models/otp.model.js'
import MediaModel from '../models/media.model.js'
import ChildModel from '../models/child.model.js'
import ExpertiseModel from '../models/expertise.model.js'
import UserModel from '../models/users.model.js'
import ProfileModel from '../models/profile.model.js'
import { sendEmails } from '../services/sendEmail.js'
import { genSalt } from '../services/saltGen.js'
import { generateOTP } from '../utils/resources/otpResource.js'
import { generateToken } from '../services/jwt.js'
import { accessTokenValidator } from '../services/accessTokenValidator.js'
import {
  emailForAccountVerification,
  emailForResetPassword,
} from '../utils/emailTemplate/emailTemplate.js'
import {
  registerValidator,
  accountVerificationValidator,
  resendOtpForAccountVerificationValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyOtpValidator,
  socialRegisterValidator,
} from '../utils/validator/authValidator.util.js'

// @Desc: Register
// @EndPoint: /api/register
// @Access: Public
export const register = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    await registerValidator.validateAsync(req.body)
    const { name, email, password, deviceType, deviceToken, userType } = req.body

    let expertiseSkills = []

    if (userType !== 'parent') {
      const expertises = await ExpertiseModel.find({ userType })
      expertiseSkills = expertises.map((expertise) => ({
        _id: expertise._id,
        skill: expertise.skill,
      }))
    }

    if (userType === 'parent') {
      if (!req.body.familyName) {
        return next(CustomError.badRequest('familyName is required for parent'))
      }
    } else if (!['therapist', 'dietitian', 'pediatrician', 'counselor'].includes(userType)) {
      return next(CustomError.badRequest('userType is not correct'))
    } else if (req.body.familyName) {
      return next(
        CustomError.badRequest('familyName should not be provided for non-parent userType'),
      )
    }

    const checkEmailExist = await AuthModel.findOne({ email })
    if (checkEmailExist) {
      return next(CustomError.badRequest('Email or name already exist'))
    }

    const createUser = await AuthModel.create(
      [
        {
          name,
          email,
          password,
          deviceType,
          deviceToken,
          userType,
          familyName: userType === 'parent' ? req.body.familyName : undefined,
        },
      ],
      {
        session,
      },
    )
    console.log(createUser[0], 'created user')
    const addDeviceToUser = await DeviceModel.findOneAndUpdate(
      { userId: createUser[0]._id },
      {
        $set: {
          deviceType,
          deviceToken,
        },
        $setOnInsert: {
          userId: createUser[0]._id,
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
        new: true,
        session,
      },
    )
    createUser[0].password = undefined
    console.log(addDeviceToUser, 'addDeviceToUser')
    const otp = generateOTP()
    console.log('generateOtp: ', otp)

    const OTP = await OtpModel.create(
      [
        {
          userId: createUser[0]._id,
          otpKey: otp,
          reason: 'verification',
        },
      ],
      {
        session,
      },
    )
    console.log(OTP, 'OTP')
    const emailDataToSend = emailForAccountVerification({ otp, name })
    console.log('emailDataToSend: ', emailDataToSend)
    if (emailDataToSend.error) {
      console.log('email if block')
      return next(CustomError.badRequest('Email not sent'))
    }
    sendEmails(email, emailDataToSend.subject, emailDataToSend.html, emailDataToSend.attachments)

    await session.commitTransaction()
    return next(
      CustomSuccess.createSuccess(
        { ...createUser[0]._doc, expertises: expertiseSkills },
        'Sign up successful and OTP was sent successfully',
        201,
      ),
    )
  } catch (error) {
    console.error(error, 'error.object')
    await session.abortTransaction()

    if (error.code === 11000) {
      return next(CustomError.createError('duplicate keys not allowed', 409))
    }
    return next(CustomError.createError(error.message, 400))
  } finally {
    console.log('finally runs')
    await session.endSession()
  }
}

// @Desc: Account Verification
// @EndPoint: /api/account_verification
// @Access: Public
export const accountVerification = async (req, res, next) => {
  try {
    await accountVerificationValidator.validateAsync(req.body)
    const { userId, otpKey } = req.body

    // if (otpKey === '') {
    //   return next(CustomError.badRequest('Please provide OTP'))
    // }

    const getOTP = await OtpModel.findOne({
      userId,
    }).sort({ _id: -1 })
    console.log({ getOTP })

    if (!getOTP) {
      return next(CustomError.notFound('OTP not found'))
    }

    if (getOTP.reason !== 'verification') {
      return next(CustomError.createError('No verification OTP found', 409))
    }

    if (getOTP.otpUsed) {
      return next(CustomError.forbidden('OTP is already used'))
    }

    const isMatch = bcrypt.compareSync(otpKey, getOTP.otpKey)
    console.log({ isMatch })
    if (!isMatch) {
      return next(CustomError.badRequest('Invalid OTP'))
    }

    const verifiedUser = await AuthModel.findOneAndUpdate(
      { _id: userId },
      { isVerified: true },
      { new: true },
    )
      .select('-password')
      .lean()
    console.log(JSON.stringify(verifiedUser), 'verifiedUser')

    const getUserDevice = await DeviceModel.findOne({ userId }).lean()
    console.log(getUserDevice, 'getUserDevice')
    await getOTP.updateOne({ otpUsed: true })

    const authToken = await generateToken({
      _id: verifiedUser._id,
      tokenType: 'login',
      deviceId: getUserDevice._id,
      userType: verifiedUser.userType,
      isTemporary: false,
    })
    console.log({ authToken }, 'authToken')
    const refreshToken = await generateToken({
      _id: verifiedUser._id,
      tokenType: 'refresh',
      deviceId: getUserDevice._id,
      isTemporary: false,
      userType: verifiedUser.userType,
    })
    console.log(refreshToken, 'refreshToken')
    return next(
      CustomSuccess.createSuccess(
        { ...verifiedUser, authToken, refreshToken },
        'OTP verified successfully',
        200,
      ),
    )
  } catch (error) {
    console.log(error)

    if (error.isJoi) {
      return next(CustomError.badRequest(error.message))
    }
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Resend OTP for account verification
// @EndPoint: /api/resend_otp
// @Access: Public
export const resendOtpForAccountVerification = async (req, res, next) => {
  try {
    await resendOtpForAccountVerificationValidator.validateAsync(req.body)
    const { userId } = req.body

    const checkUserExistWithId = await AuthModel.findOne({
      _id: userId,
    })

    if (!checkUserExistWithId) {
      return next(CustomError.notFound('No user found'))
    }

    if (checkUserExistWithId.isVerified) {
      return next(CustomSuccess.createSuccess({}, 'Your account is already verified', 200))
    }
    const otp = generateOTP()
    const OTP = await OtpModel.create({
      userId: checkUserExistWithId._id,
      otpKey: otp,
      reason: 'verification',
    })

    const emailData = emailForAccountVerification({
      otp,
      name: checkUserExistWithId.name,
    })
    if (emailData.error) {
      return next(CustomError.createError('Email data error', 500))
    }
    sendEmails(checkUserExistWithId.email, emailData.subject, emailData.html, emailData.attachments)

    return next(CustomSuccess.createSuccess({ OTP }, 'Otp was sent successfully', 200))
  } catch (error) {
    console.log({ error })
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Login
// @EndPoint: /api/login
// @Access: Public
// export const login = async (req, res, next) => {
//   try {
//     await loginValidator.validateAsync(req.body)
//     const { email, password, deviceType, deviceToken } = req.body
//     console.log(req.body, 'req.body')
//     const user = await AuthModel.findOne({
//       $or: [{ email }, { name: email }],
//     })

//     console.log(user, 'user')
//     if (!user) {
//       return next(CustomError.notFound('User not found'))
//     }

//     if (user.isBlocked) {
//       return next(CustomError.unauthorized('You are blocked'))
//     }

//     const matchPassword = bcrypt.compareSync(password, user.password)
//     console.log(matchPassword, 'matchPassword')
//     if (!matchPassword) {
//       return next(CustomError.unauthorized('Invalid credentials'))
//     }

//     if (!user.isVerified) {
//       const otp = generateOTP()

//       const otpDocument = new OtpModel({
//         userId: user._id,
//         otpKey: otp,
//         reason: 'verification',
//       })

//       await otpDocument.save()

//       const emailDataToSend = emailForAccountVerification({ otp, name: user.name })
//       console.log('emailDataToSend: ', emailDataToSend)

//       const emailSent = await sendEmails(
//         user.email,
//         emailDataToSend.subject,
//         emailDataToSend.html,
//         emailDataToSend.attachments,
//       )

//       console.log('OTP sent via email:', otp)

//       return next(
//         CustomSuccess.createSuccess(
//           { email: user.email, _id: user._id, otpSent: true },
//           'Please verify your account',
//           200,
//         ),
//       )
//     }

//     if (user.isDeleted) {
//       return next(CustomError.unauthorized('User is deleted'))
//     }

//     const updateDevice = await DeviceModel.findOneAndUpdate(
//       { userId: user._id },
//       { deviceType, deviceToken },
//       { new: true },
//     )
//     console.log(updateDevice, 'updateDevice')

//     const updateUser = await AuthModel.findOneAndUpdate({ _id: user._id }, {}, { new: true })
//     console.log(updateUser, 'updateUser')

//     await AuthModel.findByIdAndUpdate({ _id: user._id }, { $push: { devices: updateDevice._id } })
//     updateUser.password = undefined

//     let authToken
//     let refreshToken
//     let payload

//     if (user.userType === 'parent' && user.isProfileCompleted === true) {
//       authToken = await generateToken({
//         _id: updateUser._id,
//         tokenType: 'login',
//         deviceId: updateDevice._id,
//         userType: updateUser.userType,
//         isTemporary: false,
//       })
//       console.log(authToken, 'authToken')

//       refreshToken = await generateToken({
//         _id: updateUser._id,
//         tokenType: 'refresh',
//         deviceId: updateDevice._id,
//         isTemporary: false,
//         userType: updateUser.userType,
//       })

//       const childInfo = await ChildModel.find({ userId: user._id }).populate({
//         path: 'image',
//         select: 'mediaUrl -_id',
//       })

//       if (!childInfo || childInfo === 0) {
//         return next(CustomError.notFound('Empty child data'))
//       }

//       const userInfo = await UserModel.findOne({ userId: user._id }).populate({
//         path: 'image',
//         select: 'mediaUrl -_id',
//       })
//       const { country, city, state, image } = userInfo

//       payload = {
//         _id: updateUser._id,
//         name: updateUser.name,
//         email: updateUser.email,
//         userType: updateUser.userType,
//         country,
//         city,
//         state,
//         image: userInfo.image,
//         childInfo,
//         authToken,
//         refreshToken,
//         // name: updateUser.name,
//         // email: updateUser.email,
//         // userType: updateUser.userType,
//         // authToken,
//         // refreshToken,
//       }
//       console.log(refreshToken, 'refreshToken')
//       return next(CustomSuccess.createSuccess(payload, 'Login successful', 200))
//     }
//     if (user.isProfileCompleted === false) {
//       // Generate tokens when user.isProfileCompleted === false

//       authToken = await generateToken({
//         _id: updateUser._id,
//         tokenType: 'login',
//         deviceId: updateDevice._id,
//         userType: updateUser.userType,
//         isTemporary: false,
//       })
//       console.log(authToken, 'authToken')

//       refreshToken = await generateToken({
//         _id: updateUser._id,
//         tokenType: 'refresh',
//         deviceId: updateDevice._id,
//         isTemporary: false,
//         userType: updateUser.userType,
//       })

//       payload = {
//         _id: updateUser._id,
//         authToken,
//         refreshToken,
//       }

//       return next(CustomSuccess.createSuccess(payload, 'Create your profile first', 200))
//     }
//     authToken = await generateToken({
//       _id: updateUser._id,
//       tokenType: 'login',
//       deviceId: updateDevice._id,
//       userType: updateUser.userType,
//       isTemporary: false,
//     })
//     console.log(authToken, 'authToken')

//     refreshToken = await generateToken({
//       _id: updateUser._id,
//       tokenType: 'refresh',
//       deviceId: updateDevice._id,
//       isTemporary: false,
//       userType: updateUser.userType,
//     })

//     let payload2

//     payload2 = {
//       _id: updateUser._id,
//       name: updateUser.name,
//       email: updateUser.email,
//       userType: updateUser.userType,
//       authToken,
//       refreshToken,
//     }
//     console.log(refreshToken, 'refreshToken')
//     return next(CustomSuccess.createSuccess(payload2, 'Login successful', 200))
//   } catch (error) {
//     console.log({ error })
//     return next(CustomError.internal('Internal server error'))
//   }
// }
export const login = async (req, res, next) => {
  try {
    await loginValidator.validateAsync(req.body)
    const { email, password, deviceType, deviceToken } = req.body
    console.log(req.body, 'req.body')
    const user = await AuthModel.findOne({
      $or: [{ email }, { name: email }],
    })

    console.log(user, 'user')
    if (!user) {
      return next(CustomError.notFound('User not found'))
    }

    if (user.isBlocked) {
      return next(CustomError.unauthorized('You are blocked'))
    }

    const matchPassword = bcrypt.compareSync(password, user.password)
    console.log(matchPassword, 'matchPassword')
    if (!matchPassword) {
      return next(CustomError.unauthorized('Invalid credentials'))
    }

    if (!user.isVerified) {
      const otp = generateOTP()

      const otpDocument = new OtpModel({
        userId: user._id,
        otpKey: otp,
        reason: 'verification',
      })

      await otpDocument.save()

      const emailDataToSend = emailForAccountVerification({ otp, name: user.name })
      console.log('emailDataToSend: ', emailDataToSend)

      const emailSent = await sendEmails(
        user.email,
        emailDataToSend.subject,
        emailDataToSend.html,
        emailDataToSend.attachments,
      )

      console.log('OTP sent via email:', otp)

      return next(
        CustomSuccess.createSuccess(
          { email: user.email, _id: user._id, otpSent: true },
          'Please verify your account',
          200,
        ),
      )
    }

    if (user.isDeleted) {
      return next(CustomError.unauthorized('User is deleted'))
    }

    const updateDevice = await DeviceModel.findOneAndUpdate(
      { userId: user._id },
      { deviceType, deviceToken },
      { new: true },
    )
    console.log(updateDevice, 'updateDevice')

    const updateUser = await AuthModel.findOneAndUpdate({ _id: user._id }, {}, { new: true })
    console.log(updateUser, 'updateUser')

    await AuthModel.findByIdAndUpdate({ _id: user._id }, { $push: { devices: updateDevice._id } })
    updateUser.password = undefined

    let authToken
    let refreshToken
    let payload

    if (user.userType === 'parent' && user.isProfileCompleted === true) {
      authToken = await generateToken({
        _id: updateUser._id,
        tokenType: 'login',
        deviceId: updateDevice._id,
        userType: updateUser.userType,
        isTemporary: false,
      })
      console.log(authToken, 'authToken')

      refreshToken = await generateToken({
        _id: updateUser._id,
        tokenType: 'refresh',
        deviceId: updateDevice._id,
        isTemporary: false,
        userType: updateUser.userType,
      })

      const childInfo = await ChildModel.find({ userId: user._id }).populate({
        path: 'image',
        select: 'mediaUrl -_id',
      })

      if (!childInfo || childInfo === 0) {
        return next(CustomError.notFound('Empty child data'))
      }

      const userInfo = await UserModel.findOne({ userId: user._id }).populate({
        path: 'image',
        select: 'mediaUrl -_id',
      })
      const { country, city, state, image } = userInfo

      payload = {
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        userType: updateUser.userType,
        country,
        city,
        state,
        image: userInfo.image,
        childInfo,
        authToken,
        refreshToken,
        // name: updateUser.name,
        // email: updateUser.email,
        // userType: updateUser.userType,
        // authToken,
        // refreshToken,
      }
      console.log(refreshToken, 'refreshToken')
      return next(CustomSuccess.createSuccess(payload, 'Login successful', 200))
    }
    if (user.isProfileCompleted === false) {
      // Generate tokens when user.isProfileCompleted === false

      authToken = await generateToken({
        _id: updateUser._id,
        tokenType: 'login',
        deviceId: updateDevice._id,
        userType: updateUser.userType,
        isTemporary: false,
      })
      console.log(authToken, 'authToken')

      refreshToken = await generateToken({
        _id: updateUser._id,
        tokenType: 'refresh',
        deviceId: updateDevice._id,
        isTemporary: false,
        userType: updateUser.userType,
      })

      payload = {
        _id: updateUser._id,
        authToken,
        refreshToken,
      }

      return next(CustomSuccess.createSuccess(payload, 'Create your profile first', 200))
    }

    const expertProfile = await ProfileModel.findOne({ userId: user._id }).populate({
      path: 'image',
      select: 'mediaUrl -_id',
    })
    const { country, city, state, image } = expertProfile

    authToken = await generateToken({
      _id: updateUser._id,
      tokenType: 'login',
      deviceId: updateDevice._id,
      userType: updateUser.userType,
      isTemporary: false,
    })
    console.log(authToken, 'authToken')

    refreshToken = await generateToken({
      _id: updateUser._id,
      tokenType: 'refresh',
      deviceId: updateDevice._id,
      isTemporary: false,
      userType: updateUser.userType,
    })

    let payload2

    payload2 = {
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      userType: updateUser.userType,
      country,
      city,
      state,
      image: expertProfile.image,
      authToken,
      refreshToken,
    }
    console.log(refreshToken, 'refreshToken')
    return next(CustomSuccess.createSuccess(payload2, 'Login successful', 200))
  } catch (error) {
    console.log({ error })
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Forget Password
// @EndPoint: /api/forgot_password
// @Access: Public
export const forgotPassword = async (req, res, next) => {
  try {
    await forgotPasswordValidator.validateAsync(req.body)
    const { email } = req.body
    const user = await AuthModel.findOne({ email })

    if (!user) {
      return next(CustomError.notFound('User not found'))
    }

    const OTP = generateOTP()

    const emailData = emailForResetPassword({
      name: user.name,
      otp: OTP,
    })
    console.log(emailData, 'emailData')

    const otpDb = await OtpModel.create({
      userId: user._id,
      otpKey: OTP,
      reason: 'forgotPassword',
    })

    sendEmails(email, emailData.subject, emailData.html, emailData.attachments)

    return next(CustomSuccess.createSuccess(otpDb, 'OTP send Successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Reset Password
// @EndPoint: /api/reset_password
// @Access: Public
export const resetPassword = async (req, res, next) => {
  try {
    await resetPasswordValidator.validateAsync(req.body)
    const { password, otpId } = req.body

    const findOtp = await OtpModel.findOne({ _id: otpId }).sort({ _id: -1 })
    if (!findOtp) {
      return next(CustomError.notFound('No OTP found'))
    }

    if (findOtp.reason !== 'forgotPassword') {
      return next(CustomError.badRequest('No forget password otp found'))
    }

    if (!findOtp.otpUsed) {
      return next(CustomError.forbidden('Otp is not used'))
    }

    if (!findOtp.verified) {
      return next(CustomError.forbidden('Otp is not verified'))
    }

    await AuthModel.findOneAndUpdate(
      {
        _id: findOtp.userId,
      },
      {
        password: bcrypt.hashSync(password, genSalt),
      },
      { new: true },
    )
    await findOtp.deleteOne()

    return next(CustomSuccess.createSuccess({}, 'Password reset successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Verify OTP
// @EndPoint: /api/verify_otp
// @Access: Public
export const verifyOtp = async (req, res, next) => {
  try {
    await verifyOtpValidator.validateAsync(req.body)
    const { userId, otpKey } = req.body

    const getOtp = await OtpModel.findOne({
      userId,
    }).sort({ _id: -1 })
    console.log({ getOtp })

    if (!getOtp) {
      return next(CustomError.notFound('No Otp Found'))
    }

    if (getOtp.reason !== 'forgotPassword') {
      return next(CustomError.badRequest('No forget Password otp found'))
    }

    if (getOtp.otpUsed) {
      return next(CustomError.forbidden('Otp is already used'))
    }

    const isMatch = bcrypt.compareSync(otpKey, getOtp.otpKey)
    if (!isMatch) {
      return next(CustomError.createError('You have entered wrong otp', 406))
    }

    await getOtp.updateOne({ otpUsed: true, verified: true })

    return next(CustomSuccess.createSuccess(getOtp, 'OTP verified successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const logout = async (req, res, next) => {
  try {
    const { body } = req

    const device = await DeviceModel.findOne({
      userId: req.userId,
      deviceToken: body.deviceToken,
    })
    if (!device) {
      return next(CustomError.createError('User session expired', 400))
    }

    const user = await AuthModel.findByIdAndUpdate(
      req.userId,
      {
        $pull: { devices: device._id },
      },

      { new: true },
    )
    await DeviceModel.findOneAndRemove({ _id: device._id, userId: req.userId })

    return next(CustomSuccess.createSuccess('', 'User logged out successfully', 200))
  } catch (err) {
    return next(CustomError.createError(err.message, 500))
  }
}

// @Desc Social Register
// @EndPoint: /api/social_auth
// @Access: Public
export const socialRegister = async (req, res) => {
  try {
    await socialRegisterValidator.validateAsync(req.body)
    const { socialType, accessToken, deviceType, deviceToken } = req.body
    console.log(req.body, 'req.body')
    const { hasError, message, data } = await accessTokenValidator(accessToken, socialType)
    if (hasError) {
      return res.status(401).json({
        message,
        status: false,
      })
    }
    const { name, image, identifier, dateOfBirth, gender } = data
    console.log(data, 'data ******')
    console.log(message, 'message ******')
    console.error(hasError, 'hasError ******')
    let user = await AuthModel.findOneAndUpdate(
      { socialIdentifier: bcrypt.hashSync(identifier, genSalt) },
      {
        $set: {
          socialIdentifier: bcrypt.hashSync(identifier, genSalt),
          socialType,
          socialAccessToken: bcrypt.hashSync(accessToken, genSalt),
        },
        $setOnInsert: {
          isVerified: true,
          name: name || '',
          gender: gender || '',
          dateOfBirth: dateOfBirth || '',
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    )
    console.log(user, 'user')
    const createMedia = await MediaModel.create({
      mediaType: 'media',
      mediaUrl: image,
      userId: user._id,
      userType: 'parent',
    })
    console.log(createMedia, 'createMedia')
    user = await AuthModel.findOneAndUpdate(
      { _id: user._id },
      { image: createMedia._id },
      { new: true },
    ).populate({ path: 'image' })

    const getUserDevice = await DeviceModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          deviceType,
          deviceToken,
        },
        $setOnInsert: {
          userId: user._id,
        },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
        new: true,
      },
    )
    console.log({ user })

    const authToken = await generateToken({
      _id: user._id,
      tokenType: 'login',
      deviceId: getUserDevice._id,
      isTemporary: false,
      userType: user.userType,
    })
    console.log(authToken, 'authToken')
    if (authToken.error) {
      return res.status(400).json({
        message: authToken.message,
        status: false,
      })
    }

    const refreshToken = await generateToken({
      _id: user._id,
      tokenType: 'refresh',
      deviceId: getUserDevice._id,
      isTemporary: false,
      userType: user.userType,
    })
    console.log('refreshToken', refreshToken)
    if (refreshToken.error) {
      return res.status(400).json({
        message: refreshToken.message,
        status: false,
      })
    }
    return res.status(200).json({
      message: 'User logged in successfully',
      data: { ...user._doc, authToken, refreshToken },
      status: true,
    })
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      status: false,
    })
  }
}
