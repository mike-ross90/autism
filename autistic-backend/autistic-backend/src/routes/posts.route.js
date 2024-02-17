import express from 'express'
import { handleMultipartDataForBoth } from '../utils/multipartData.js'
import {
  createPost,
  getAllPosts,
  reportPost,
  hidePost,
  updatePost,
  reactToPost,
  commentPost,
  deleteComment,
  getAllComments,
  sharePost,
  deletePost,
  getYourPost,
  searchPost,
  reactToComment,
  getReactsOnComments,
  getReactsOnPost,
  reportAny,
  getReportsByUser,
  getReportTag,
  replayToComment,
  getPostById,
  deleteReplay,
} from '../controllers/posts.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
const router = express.Router()

router
  .route('/create_post')
  .post([authMiddleware, handleMultipartDataForBoth.array('media', 6), createPost])
router.route('/get_all_posts').get([authMiddleware, getAllPosts])
router.route('/report_post').post([authMiddleware, reportPost])
router.route('/hide_post').post([authMiddleware, hidePost])
router.route('/update_post').post([authMiddleware, updatePost])
router.route('/react_post').post([authMiddleware, reactToPost])
router.route('/react_comment').post([authMiddleware, reactToComment])
router.route('/comment_post').post([authMiddleware, commentPost])
router.route('/replay_comment_post').post([authMiddleware, replayToComment])
router.route('/delete_comment').post([authMiddleware, deleteComment])
router.route('/get_all_comments').get([authMiddleware, getAllComments])
router.route('/share_post').post([authMiddleware, sharePost])
router.route('/get_likes').get([authMiddleware, getReactsOnPost])
router.route('/get_comments').get([authMiddleware, getReactsOnComments])
router.route('/delete_post').delete([authMiddleware, deletePost])
router.route('/get_your_posts').get([authMiddleware, getYourPost])
router.route('/get_post_by_id').get([authMiddleware, getPostById])
router.route('/delete_replay').delete([authMiddleware, deleteReplay])
router.route('/search_post').get([authMiddleware, searchPost])
router.route('/reportAny').post([authMiddleware, reportAny])
// router.route('/getReportsByType/:reportedType').get([authMiddleware, getReportsByType])
router.route('/getReportsByUser').get([authMiddleware, getReportsByUser])
router.route('/getReportTags').get([authMiddleware, getReportTag])

export default router
