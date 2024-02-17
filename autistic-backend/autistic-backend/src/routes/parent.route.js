import express from 'express'
import {
  diagnosticForm,
  getHealthProfessionalProfileById,
  getAllHealthProfessionals,
  getParentProfileById,
  updateParentProfile,
  getAllParentConsultations,
  searchProfiles,
  createReview,
  getAllParentsSchedules,
  getHealthProfessionalCalendarById,
  getAbout,
  getTerms,
  getPolicy,
  sendFeedback,
  createParentProfile,
  createChildren,
  updateChildren,
  createVisual,
  myVisuals,
} from '../controllers/parentHome.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { handleMultipartData } from '../utils/multipartData.js'
const router = express.Router()

// @Desc: Role Parent Home
router.route('/diagnostic_form').post(authMiddleware, diagnosticForm)
router
  .route('/create_profile')
  .post([authMiddleware, handleMultipartData.single('image'), createParentProfile])
router
  .route('/update_profile/')
  .put([authMiddleware, handleMultipartData.single('image'), updateParentProfile])
router
  .route('/create_children')
  .post([authMiddleware, handleMultipartData.single('image'), createChildren])
router
  .route('/update_children')
  .put([authMiddleware, handleMultipartData.single('image'), updateChildren])
router.route('/get_consultant/:profileId').get(authMiddleware, getHealthProfessionalProfileById)
router.route('/get_calendar/:calendarId').get(authMiddleware, getHealthProfessionalCalendarById)
router.route('/get_all_professionals').get(authMiddleware, getAllHealthProfessionals)
router.route('/parent_profile').get(authMiddleware, getParentProfileById)
router.route('/therapist_profiles').get(authMiddleware, getAllParentConsultations)
router.route('/get_all_parents_schedules').get(authMiddleware, getAllParentsSchedules)
router.route('/search_professionals').get(authMiddleware, searchProfiles)
router.route('/create_review').post(authMiddleware, createReview)
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
router.route('/create_visual').post(authMiddleware, createVisual)
router.route('/my_visuals').get(authMiddleware, myVisuals)
export default router
