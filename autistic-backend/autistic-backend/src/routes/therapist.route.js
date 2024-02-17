import express from 'express'
import {
  addSkill,
  addTherapistProfile,
  confirmDiagnosticForm,
  getAbout,
  getAllMyCalendars,
  getAllMyConsultations,
  getAllTherapistReviews,
  getPolicy,
  getReviewsByReviewId,
  getTerms,
  // getTherapistConsultations,
  getTherapistProfileById,
  selectTherapistDates,
  sendFeedback,
  updateDiagnosticStatus,
  updateTherapistProfile,
  updateTherapistTiming,
} from '../controllers/therapistHome.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { handleMultipartData } from '../services/multiPartData.js'
const router = express.Router()

router
  .route('/add_profile')
  .post([authMiddleware, handleMultipartData.single('image'), addTherapistProfile])
router
  .route('/update_therapist/:userId')
  .put([authMiddleware, handleMultipartData.single('image'), updateTherapistProfile])
router.route('/get_all_calendar').get([authMiddleware, getAllMyCalendars])
router.route('/calendar_select').post(authMiddleware, selectTherapistDates)
router.route('/calendar_update').put(authMiddleware, updateTherapistTiming)
// router.route('/consultations').get(authMiddleware, getTherapistConsultations)
router.route('/my_consultations').get(authMiddleware, getAllMyConsultations)
router.route('/consultation_status').patch(authMiddleware, updateDiagnosticStatus)
router.route('/therapist_profile/:userId').get(authMiddleware, getTherapistProfileById)
router.route('/therapist_all_reviews').get(authMiddleware, getAllTherapistReviews)
router.route('/get_reviews/:reviewId').get(authMiddleware, getReviewsByReviewId)
router.route('/confirm-diagnostic').patch(authMiddleware, confirmDiagnosticForm)
router.route('/add_skill').post(authMiddleware, addSkill)
router.route('/about').get(authMiddleware, getAbout)
router.route('/terms').get(authMiddleware, getTerms)
router.route('/policy').get(authMiddleware, getPolicy)
router
  .route('/feedback')
  .post([
    authMiddleware,
    handleMultipartData.fields([{ name: 'image', maxCount: 6 }]),
    sendFeedback,
  ])

export default router
