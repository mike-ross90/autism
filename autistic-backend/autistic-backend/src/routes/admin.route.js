import express from 'express'
import {
  adminLogin,
  adminRegister,
  blockUserById,
  createExpertise,
  createGroup,
  getAllBlockedUsers,
  getAllParents,
  getAllSkillsByUsertype,
  getAllExperts,
  updateSkill,
  createAbout,
  deleteAbout,
  createTerms,
  deleteTerms,
  createPrivacy,
  deletePrivacy,
  getAbout,
  getTerms,
  getPolicy,
  createAction,
  getActions,
  getAllGroups,
  deleteGroupById,
  getGroupById,
  updateGroupById,
  analytics,
  createReportTag,
  editReportTag,
  getReportsByType,
  getFullReportById,
} from '../controllers/admin.controller.js'
import { adminMiddleware } from '../middleware/admin.middleware.js'
import { handleMultipartData } from '../services/multiPartData.js'
import { getReportTag } from '../controllers/posts.controller.js'
const router = express.Router()

router.route('/admin_register').post(adminRegister)
router.route('/admin_login').post(adminLogin)
router.route('/create_expertise').post(adminMiddleware, createExpertise)
router.route('/get_all_skills').get(adminMiddleware, getAllSkillsByUsertype)
router.route('/update_skill').patch(adminMiddleware, updateSkill)
router.route('/get_all_experts').get(adminMiddleware, getAllExperts)
router.route('/get_all_parents').get(adminMiddleware, getAllParents)
router.route('/block_user/:userId').patch(adminMiddleware, blockUserById)
router.route('/get_blocked_users').get(adminMiddleware, getAllBlockedUsers)
router.route('/create_group').post([
  adminMiddleware,
  // handleMultipartData.single('profileImage'),
  handleMultipartData.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
  ]),
  createGroup,
])
router.route('/get_all_groups').get(adminMiddleware, getAllGroups)
router.route('/delete_group').delete(adminMiddleware, deleteGroupById)
router.route('/get_group').get(adminMiddleware, getGroupById)
router.post(
  '/update_group/:groupId',
  adminMiddleware,
  handleMultipartData.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
  ]),
  updateGroupById,
)

// about
router.route('/create_about').post(adminMiddleware, createAbout)
router.route('/about').get(adminMiddleware, getAbout)
router.route('/delete_about').delete(adminMiddleware, deleteAbout)

// terms
router.route('/create_terms').post(adminMiddleware, createTerms)
router.route('/terms').get(adminMiddleware, getTerms)
router.route('/delete_terms').delete(adminMiddleware, deleteTerms)

// privacy
router.route('/create_privacy').post(adminMiddleware, createPrivacy)
router.route('/policy').get(adminMiddleware, getPolicy)
router.route('/delete_privacy').delete(adminMiddleware, deletePrivacy)

// action for visual schedule
router
  .route('/create_action')
  .post([adminMiddleware, handleMultipartData.single('image')], createAction)
router.route('/actions').get(adminMiddleware, getActions)

// analytics
router.route('/analytics').get(adminMiddleware, analytics)

// report
router.route('/create_reportTag').post(adminMiddleware, createReportTag)
router.route('/edit_reportTag').patch(adminMiddleware, editReportTag)
router.route('/getReportsByType/:reportedType').get(adminMiddleware, getReportsByType)
router.route('/getReportTags').get(adminMiddleware, getReportTag)
router.route('/getFullReportById').get(adminMiddleware, getFullReportById)

export default router
