import express from 'express'
import { handleMultipartDataForBoth } from '../utils/multipartData.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import {
  commentPost,
  createPost,
  deleteComment,
  deletePost,
  getAllComments,
  getAllGroups,
  getAllPosts,
  getGroupById,
  getGroupInfoById,
  getReactsOnComments,
  getReactsOnPost,
  getYourPost,
  // hidePost,
  joinGroup,
  reactToComment,
  reactToPost,
  reportPost,
  searchPost,
  sharePost,
  updatePost,
} from '../controllers/groups.controller.js'
const router = express.Router()

router.route('/get_all_groups').get(authMiddleware, getAllGroups)
router.route('/get_group_info/:groupId').get(authMiddleware, getGroupInfoById)
router.route('/join_group/:groupId').post(authMiddleware, joinGroup)
router
  .route('/create_post/:groupId')
  .post([authMiddleware, handleMultipartDataForBoth.array('media', 6), createPost])
router.route('/update_post').post([authMiddleware, updatePost])
router.route('/get_group/:groupId').get(authMiddleware, getGroupById)
router.route('/search_post').get([authMiddleware, searchPost])
router.route('/share_post').post([authMiddleware, sharePost])
router.route('/report_post').post([authMiddleware, reportPost])
// router.route('/hide_post').post([authMiddleware, hidePost])
router.route('/react_post').post([authMiddleware, reactToPost])
router.route('/comment_post').post([authMiddleware, commentPost])
router.route('/react_comment').post([authMiddleware, reactToComment])
router.route('/get_all_comments').get([authMiddleware, getAllComments])
router.route('/get_all_posts').get([authMiddleware, getAllPosts])
router.route('/get_your_posts').get([authMiddleware, getYourPost])
router.route('/get_likes').get([authMiddleware, getReactsOnPost])
router.route('/get_comments').get([authMiddleware, getReactsOnComments])
router.route('/delete_comment').post([authMiddleware, deleteComment])
router.route('/delete_post').delete([authMiddleware, deletePost])

export default router
