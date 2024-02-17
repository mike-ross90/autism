import DietsModel from '../models/diet.model.js'
import DiagnosticModel from '../models/pre-diagnostic.model.js'
import CustomSuccess from '../utils/responseHandlers/customSuccess.util.js'
import CustomError from '../utils/responseHandlers/customError.util.js'
import { checkMongooseId } from '../services/mongooseResource.js'
// import AuthModel from '../models/auth.model.js'
// import ProfileModel from '../models/profile.model.js'

// @Desc:  Create Diet Plan For Parent
// @Route: POST /api/notes/create_diets
// @Access: Private
export const createDietPlans = async (req, res, next) => {
  try {
    const { userId, userType } = req
    const { startDate, endDate, breakfast, lunch, brunch, dinner } = req.body
    const { formId } = req.query

    if (!checkMongooseId(userId)) {
      return next(CustomError.badRequest('Invalid Id'))
    }

    if (userType !== 'dietitian') {
      return next(CustomError.forbidden('Only dietitian can create diet plans'))
    }

    const diagnosticRecord = await DiagnosticModel.findOne({ _id: formId })
      .populate({
        path: 'profileId',
        match: { userId: userId },
      })
      .exec()

    if (!diagnosticRecord) {
      return next(CustomError.notFound('Diagnostic record not found'))
    }

    if (!diagnosticRecord.profileId) {
      return next(CustomError.forbidden('You can only create diet plans for your patients'))
    }

    const createDiet = new DietsModel({
      dietitianId: userId,
      parentId: formId,
      startDate,
      endDate,
      breakfast,
      lunch,
      brunch,
      dinner,
    })

    const savedDietPlan = await createDiet.save()

    return next(CustomSuccess.createSuccess(savedDietPlan, 'Diet plan created successfully', 201))
  } catch (error) {
    console.error('Error:', error.message)
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc:  Get My Diets Patients
// @Route: POST /api/notes/get_all_diets
// @Access: Private
export const getAllConfirmedPatients = async (req, res, next) => {
  try {
    const { userId, userType } = req
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const familyNameQuery = req.query.familyName

    if (!checkMongooseId(userId)) {
      return next(CustomError.badRequest('Invalid Id'))
    }

    if (userType !== 'dietitian') {
      return next(CustomError.forbidden('Only dietitian can see all of this patients'))
    }

    const diagnosticRecords = await DiagnosticModel.find()
      .populate({
        path: 'profileId',
        match: { userId: userId },
      })
      .populate({
        path: 'userId',
        select: 'familyName',
      })
      .exec()

    if (!diagnosticRecords || diagnosticRecords.length === 0) {
      return next(CustomSuccess.createSuccess([], 'No diagnostic records found for this user', 200))
    }

    const filteredRecords = diagnosticRecords.filter((record) => record.profileId)

    let confirmedAndAcceptedRecords = filteredRecords.filter(
      (record) => record.status === 'confirmed' && record.isAccepted === true,
    )

    if (familyNameQuery) {
      const filteredByFamilyName = confirmedAndAcceptedRecords.filter((record) =>
        record.userId.familyName.toLowerCase().includes(familyNameQuery.toLowerCase()),
      )
      confirmedAndAcceptedRecords = filteredByFamilyName
    }

    // const totalCount = confirmedAndAcceptedRecords.length
    // const totalPages = Math.ceil(totalCount / pageSize)

    const paginatedRecords = confirmedAndAcceptedRecords.slice(
      (page - 1) * pageSize,
      page * pageSize,
    )

    const payload = paginatedRecords.map((record) => ({
      familyName: record.userId.familyName,
      location: record.location,
    }))

    return next(
      CustomSuccess.createSuccess(
        {
          payload,
          // totalPages,
          // currentPage: page,
          // pageSize: pageSize,
          // totalCount,
        },
        'Diagnostic records retrieved successfully',
        200,
      ),
    )
  } catch (error) {
    console.error('Error:', error.message)
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc:  Get All My Diets
// @Route: POST /api/diet/get_all_my_diets
// @Access: Private
export const getAllMyDiets = async (req, res, next) => {
  try {
    const { userId, userType } = req

    if (!checkMongooseId(userId)) {
      return next(CustomError.badRequest('Invalid Id'))
    }

    if (userType !== 'parent') {
      return next(CustomError.forbidden('Only parent can see his diets'))
    }

    const diagnostic = await DiagnosticModel.findOne({ userId })

    if (!diagnostic) {
      return next(CustomError.notFound('Parent diagnostic record not found.'))
    }

    const diets = await DietsModel.find({ parentId: diagnostic._id })

    return next(CustomSuccess.createSuccess(diets, 'Diets fetched successfully', 200))
  } catch (error) {
    return next(CustomError.internal(error.message))
  }
}

// @Desc:  Update Diet By Id
// @Route: POST /api/diet/update_diet
// @Access: Private
export const updateDietPlan = async (req, res, next) => {
  try {
    const { userId } = req
    const { dietId } = req.query
    const { startDate, endDate, breakfast, lunch, brunch, dinner } = req.body

    if (!checkMongooseId(dietId)) {
      return next(CustomError.badRequest('Invalid Diet Plan Id'))
    }

    const dietPlan = await DietsModel.findOne({ _id: dietId, dietitianId: userId })

    if (!dietPlan) {
      return next(CustomError.notFound('Diet Plan not found'))
    }

    dietPlan.startDate = startDate
    dietPlan.endDate = endDate
    dietPlan.breakfast = breakfast
    dietPlan.lunch = lunch
    dietPlan.brunch = brunch
    dietPlan.dinner = dinner

    const updatedDietPlan = await dietPlan.save()

    return next(CustomSuccess.createSuccess(updatedDietPlan, 'Diet plan updated successfully', 200))
  } catch (error) {
    console.error('Error:', error.message)
    return next(CustomError.internal('Internal server error'))
  }
}
