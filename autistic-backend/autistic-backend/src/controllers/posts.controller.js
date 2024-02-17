import {
  createPostValidator,
  reportPostValidator,
  hidePostValidator,
  updatePostValidator,
  paginationValidator,
  commentPostValidator,
  deleteCommentValidator,
  getAllCommentsValidator,
  sharePostValidator,
  getReactsOnLikesValidator,
  deletePostValidator,
  reactOnCommentValidator,
  reactOnPostValidator,
  searchPostValidator,
  getReactsOnCommentsValidator,
  reportAnyValidator,
  replayPostValidator,
} from '../utils/validator/postsValidator.js'
import { uploadMedia } from '../utils/resources/imgResource.js'
import PostsModel from '../models/posts.model.js'
import PostReactionModel from '../models/postReaction.model.js'
import CommentReactionModel from '../models/commentReaction.model.js'
import PostCommentModel from '../models/postComment.model.js'
import AuthModel from '../models/auth.model.js'
import CustomSuccess from '../utils/responseHandlers/customSuccess.util.js'
import CustomError from '../utils/responseHandlers/customError.util.js'
import { checkMongooseId } from '../utils/resources/mongoose.resource.js'
import mongoose, { Types } from 'mongoose'
import { unlinkSync } from 'fs'
import { generateThumbnail } from '../middleware/uploadPost.middleware.js'
import ReportModel from '../models/report.model.js'
import ReportTagModel from '../models/reportTags.model.js'

import ReplayModel from '../models/replay.model.js'

// @Desc: Create Post
// @EndPoint: /api/create_post
// @Access: Private
export const createPost = async (req, res, next) => {
  try {
    const files = req.files
    const filesLength = files.length
    await createPostValidator.validateAsync(req.body)
    if (!files || filesLength === 0) {
      return next(CustomError.createError('No file provided to post', 400))
    }

    if (files[0].mimetype.includes('video')) {
      var mediaThumbnail = await generateThumbnail(files[0])

      const uploadPostVideo = await uploadMedia(files[0], 'video', req.body.userId, 'parent')
      var videoUrl = await Promise.resolve(uploadPostVideo)
    } else {
      const mediaToDB = files.map(async (file) => {
        const mediaUrl = await uploadMedia(file, 'image', req.userId, 'parent')
        return mediaUrl
      })
      var allMediaUrl = await Promise.all([...mediaToDB])
    }

    const createPost = await PostsModel.create({
      ...req.body,
      userId: req.userId,
      postMedia: files[0].mimetype.includes('video') ? videoUrl : [...allMediaUrl],
      postCaption: req.body.postCaption,
      postMediaType: req.body.postMediaType,
      postThumbnail: mediaThumbnail,
    })
    return next(CustomSuccess.createSuccess(createPost, 'Post Created Successfully', 200))
  } catch (error) {
    if (req?.files) {
      // eslint-disable-next-line array-callback-return
      req.files.map((obj) => {
        unlinkSync(obj.path)
      })
    }
    console.log(error)
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Search Post
// @EndPoint: /api/search_post
// @Access: Private
export const searchPost = async (req, res, next) => {
  try {
    const { body } = req

    await searchPostValidator.validateAsync(body)
    const search = await PostsModel.aggregate([
      {
        $lookup: {
          from: 'auths',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $unwind: '$userId',
      },

      {
        $lookup: {
          from: 'media',
          localField: 'postMedia',
          foreignField: '_id',
          as: 'postMedia',
        },
      },
      {
        $match: {
          postCaption: new RegExp(body.prompt),
          isDeleted: false,
        },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $project: {
          'userId.fullName': 1,
          'userId.image': 1,
          'userId.email': 1,
          _id: 1,
          postMedia: 1,
          postMediaType: 1,
          postCaption: 1,
          postThumbnail: 1,
        },
      },
    ])
    return next(CustomSuccess.createSuccess(search, 'Posts fetched Successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Get All Posts
// @EndPoint: /api/get_all_posts
// @Access: Private
export const getAllPosts = async (req, res, next) => {
  try {
    const { page, limit } = req.query
    await paginationValidator.validateAsync(req.query)
    const user = await AuthModel.findOne({
      _id: req.userId,
    }).select('blockUsers')

    const blockUserIds = user.blockUsers.map((userId) => String(userId))

    const skip = (Number(page) - 1) * Number(limit)

    const allPosts = await PostsModel.aggregate([
      {
        $match: {
          isDeleted: false,
          reported: { $nin: [new Types.ObjectId(req.userId.toString())] },
          hidePost: { $nin: [new Types.ObjectId(req.userId.toString())] },
          userId: { $nin: blockUserIds },
        },
      },
      {
        $lookup: {
          from: 'postreactions',
          localField: '_id',
          foreignField: 'postId',
          as: 'reacts',
        },
      },
      {
        $lookup: {
          from: 'postreactions',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes',
        },
      },

      //     {
      //     $unwind: "$likes",
      //   },
      {
        $lookup: {
          from: 'postcomments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'userId',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'media',
          localField: 'postMedia',
          foreignField: '_id',
          as: 'postMedia',
        },
      },
      {
        $unwind: '$users',
      },
      {
        $lookup: {
          from: 'media',
          localField: 'users.image',
          foreignField: '_id',
          as: 'parentImage',
        },
      },

      {
        $unwind: '$parentImage',
      },
      {
        $project: {
          _id: 1,
          postMedia: '$postMedia.mediaUrl',
          postMediaType: 1,
          isDeleted: 1,
          postCaption: 1,
          reported: 1,
          hidePost: 1,
          postThumbnail: 1,
          isShared: 1,
          originalPost: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
          users: {
            _id: 1,
            userId: 1,
            name: 1,
            city: 1,
            state: 1,
            mediaUrl: '$parentImage.mediaUrl',
          },
          likes: '$likes',
          //   "likes":{
          //       "reactionType":1,
          //       "userId":1,
          //   },
          likesCount: { $size: '$reacts' },
          commentsCount: { $size: '$comments' },
        },
      },
      {
        $unset: ['comments', 'parentImage'],
      },
      {
        $sort: { updatedAt: -1 },
      },
      //   {
      //     $sort: { createdAt: -1 },
      //   },
      {
        $skip: skip,
      },
      {
        $limit: Number(limit),
      },
    ])

    return next(CustomSuccess.createSuccess(allPosts, 'Posts fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Repost Post
// @EndPoint: /api/report_post
// @Access: Private
export const reportPost = async (req, res, next) => {
  try {
    await reportPostValidator.validateAsync(req.body)
    const userId = req.userId

    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const report = await PostsModel.findByIdAndUpdate(
      req.body.postId,
      { $addToSet: { reported: userId } },
      {
        new: true,
      },
    )

    if (!report) {
      return next(CustomError.createError('Post not found', 200))
    }
    return next(CustomSuccess.createSuccess(report, 'Post reported successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Hide Post
// @EndPoint: /api/hide_post
// @Access: Private
export const hidePost = async (req, res, next) => {
  try {
    await hidePostValidator.validateAsync(req.body)
    const userId = req.userId
    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const hide = await PostsModel.findByIdAndUpdate(
      req.body.postId,
      { $addToSet: { hidePost: userId } },
      {
        new: true,
      },
    )
    if (!hide) {
      return next(CustomError.createError('Post does not exist', 200))
    }
    return next(CustomSuccess.createSuccess(hide, 'Post hidden successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Update Post
// @EndPoint: /api/update_post
// @Access: Private
export const updatePost = async (req, res, next) => {
  try {
    await updatePostValidator.validateAsync(req.body)
    // const userId = req.userId
    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.createError('Invalid id provided', 400))
    }
    const updatePost = await PostsModel.findByIdAndUpdate(
      req.body.postId,
      {
        $set: {
          postCaption: req.body.postCaption,
        },
      },
      {
        new: true,
      },
    )
    if (!updatePost) {
      return next(CustomError.createError('Post Does Not Exist', 200))
    }
    return next(CustomSuccess.createSuccess(updatePost, 'Post updated successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: React Post
// @EndPoint: /api/react_post
// @Access: Private
export const reactToPost = async (req, res, next) => {
  try {
    await reactOnPostValidator.validateAsync(req.body)

    const { postId, reactionType } = req.body

    if (!checkMongooseId(postId)) {
      return next(CustomError.createError('Invalid id provided', 400))
    }

    const checkPost = await PostsModel.findById({ _id: postId })

    if (!checkPost) {
      return next(CustomError.createError('Post Does Not Exist', 400))
    }

    const existingReaction = await PostReactionModel.findOne({
      postId,
      userId: req.userId,
    })

    if (existingReaction) {
      const removeReaction = await PostReactionModel.findOneAndRemove({
        postId,
        userId: req.userId,
      })
      return next(CustomSuccess.createSuccess(removeReaction, 'Reaction Removed Successfully', 200))
    } else {
      const reactedPost = await PostReactionModel.create({
        postId,
        userId: req.userId,
        reactionType,
        reactionOn: 'Post',
      })
      return next(CustomSuccess.createSuccess(reactedPost, 'Post reacted successfully', 200))
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: React Comment
// @EndPoint: /api/react_comment
// @Access: Private
export const reactToComment = async (req, res, next) => {
  try {
    await reactOnCommentValidator.validateAsync(req.body)

    const { commentId, reactionType } = req.body

    if (!checkMongooseId(commentId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }

    const checkComment = await PostCommentModel.findById(commentId)

    if (!checkComment) {
      return next(CustomError.notFound('Comment Does Not Exist'))
    }

    const existingReaction = await CommentReactionModel.findOne({
      commentId,
      userId: req.userId,
    })

    if (existingReaction) {
      const removeReaction = await CommentReactionModel.findOneAndRemove({
        commentId,
        userId: req.userId,
      })
      return next(CustomSuccess.createSuccess(removeReaction, 'Reaction Removed Successfully', 200))
    } else {
      const reactedComment = await CommentReactionModel.create({
        commentId,
        userId: req.userId,
        reactionType,
        reactionOn: 'Comment',
      })
      return next(CustomSuccess.createSuccess(reactedComment, 'Comment reacted successfully', 200))
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Comment Post
// @EndPoint: /api/comment_post
// @Access: Private
export const commentPost = async (req, res, next) => {
  try {
    await commentPostValidator.validateAsync(req.body)
    const userId = req.userId
    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const checkPost = await PostsModel.findById({ _id: req.body.postId })
    if (!checkPost) {
      return next(CustomError.notFound('Post Does Not exist'))
    }
    const commentPost = await PostCommentModel.create({
      postId: req.body.postId,
      userId,
      postComment: req.body.postComment,
    })
    return next(CustomSuccess.createSuccess(commentPost, 'Commented on post successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Delete Comment
// @EndPoint: /api/delete_post
// @Access: Private
export const deleteComment = async (req, res, next) => {
  try {
    const userId = req.userId
    await deleteCommentValidator.validateAsync(req.body)
    if (!checkMongooseId(req.body.commentId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const checkComment = await PostCommentModel.find({
      commentId: req.body.commentId,
      userId,
    })
    if (checkComment.length === 0) {
      return next(CustomError.notFound('Comment Does Not exist'))
    }
    const deleteComment = await PostCommentModel.deleteOne({
      commentId: req.body.commentId,
      userId,
    })

    if (deleteComment.deletedCount === 0) {
      return next(CustomError.badRequest('Invalid commentId or userId provided'))
    }
    return next(CustomSuccess.createSuccess(deleteComment, 'Comment deleted successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Get All Comments
// @EndPoint: /api/get_all_comments
// @Access: Private
export const getAllComments = async (req, res, next) => {
  try {
    const { postId } = req.query
    await getAllCommentsValidator.validateAsync(req.query)
    if (!checkMongooseId(postId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const checkPost = await PostsModel.findById(postId)
    if (!checkPost) {
      return next(CustomError.notFound('Post Does Not Exist'))
    }
    const allComments = await PostCommentModel.find({ postId: postId })

    if (!allComments) {
      return next(CustomError.badRequest('Invalid postId provided'))
    }
    return next(CustomSuccess.createSuccess(allComments, 'All comments fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Share Post
// @EndPoint: /api/share_post
// @Access: Private
export const sharePost = async (req, res, next) => {
  try {
    await sharePostValidator.validateAsync(req.body)
    const userId = req.userId

    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const checkPost = await PostsModel.findById({ _id: req.body.postId })
    if (!checkPost) {
      return next(CustomError.notFound('Post Does Not exist'))
    }
    const sharedPost = await PostsModel.create({
      postCaption: req.body.postCaption,
      originalPost: req.body.postId,
      userId: userId,
      isShared: true,
    })

    if (!sharedPost) {
      return next(CustomError.badRequest('sharing failed'))
    }
    return next(CustomSuccess.createSuccess(sharedPost, 'Post Shared Successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Get All Reacts On Post
// @EndPoint: /api/get_likes
// @Access: Private
export const getReactsOnPost = async (req, res, next) => {
  try {
    const { postId } = req.query
    await getReactsOnLikesValidator.validateAsync(req.query)
    if (!checkMongooseId(postId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const listOfLikes = await PostReactionModel.find({ postId: postId })
    if (listOfLikes) {
      const listOfUsers = await PostReactionModel.populate(listOfLikes, [
        {
          path: 'userId',
          model: 'Auth',
          select: 'name image',
          populate: 'image',
        },
      ])

      return next(CustomSuccess.createSuccess(listOfUsers, 'List of likes on Post', 200))
    }
    return next(CustomError.createError('Something went wrong', 400))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Get All Reacts On Comment
// @EndPoint: /api/get_comments
// @Access: Private
export const getReactsOnComments = async (req, res, next) => {
  try {
    const { commentId } = req.query
    await getReactsOnCommentsValidator.validateAsync(req.query)
    if (!checkMongooseId(commentId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const listOfComments = await CommentReactionModel.find({
      commentId: commentId,
    })
    if (listOfComments) {
      const listOfUsers = await PostReactionModel.populate(listOfComments, [
        {
          path: 'userId',
          model: 'Auth',
          select: 'name image',
          populate: 'image',
        },
      ])

      return next(CustomSuccess.createSuccess(listOfUsers, 'List of likes on Comment', 200))
    }
    return next(CustomError.createError('Something went wrong', 400))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Delete Post
// @EndPoint: /api/delete_post
// @Access: Private
export const deletePost = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    await deletePostValidator.validateAsync(req.query)
    const { postId } = req.query
    if (!checkMongooseId(postId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const checkOwner = await PostsModel.findOne(
      {
        _id: postId,
        userId: req.userId,
      },
      null,
      {
        session,
      },
    )
    if (!checkOwner) {
      await session.abortTransaction()
      return next(CustomError.forbidden('You are not the creator of this post'))
    }
    const findSharedPost = await PostsModel.find(
      {
        originalPost: postId,
        isShared: true,
      },
      null,
      {
        session,
      },
    )

    if (findSharedPost.length > 0) {
      await PostsModel.updateMany(
        { originalPost: postId },
        { $set: { originalPost: null } },
        {
          session,
          new: true,
          upsert: true,
        },
      )
    }

    const originalPost = await PostsModel.findOneAndDelete(
      { _id: postId, userId: req.userId },

      {
        session,
        new: true,
      },
    )
    const deleteLikes = await PostReactionModel.deleteMany({ postId: postId })
    if (!deleteLikes) {
      await session.abortTransaction()
      return next(CustomError.badRequest('Likes Not removed'))
    }
    const deleteComments = await PostCommentModel.deleteMany({
      postId: postId,
    })
    if (!deleteComments) {
      await session.abortTransaction()
      return next(CustomError.notFound('Comments Not removed'))
    }

    if (originalPost) {
      await session.commitTransaction()
      return next(CustomSuccess.createSuccess(originalPost, 'post deleted successfully', 200))
    }
    await session.abortTransaction()
    return next(CustomError.createError('Something went wrong', 400))
  } catch (error) {
    await session.abortTransaction()
    return next(CustomError.createError(error.message, 400))
  } finally {
    await session.endSession()
  }
}

// @Desc: Get Your Post
// @EndPoint: /api/get_your_posts
// @Access: Private
export const getYourPost = async (req, res, next) => {
  try {
    // const { userId } = req.body;
    const userId = req.userId
    const { page, id } = req.query
    let UserPosts = await PostsModel.aggregate([
      {
        $match: {
          isDeleted: false,
          userId: new Types.ObjectId(id.toString()),
          reported: { $nin: [new Types.ObjectId(userId.toString())] },
          hidePost: { $nin: [new Types.ObjectId(userId.toString())] },
        },
      },
      {
        $lookup: {
          from: 'postreactions',
          localField: '_id',
          foreignField: 'postId',
          as: 'reactions',
        },
      },
      {
        $lookup: {
          from: 'postcomments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          reactionsCount: { $size: '$reactions' },
          commentsCount: { $size: '$comments' },
        },
      },
      {
        $unset: ['reactions', 'comments'],
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $skip: (Number(page) - 1) * 10,
      },
      {
        $limit: 10,
      },
    ])
    if (!UserPosts) {
      return next(CustomSuccess.ok('No Posts exist'))
    }

    const commentReactionsCounts = await CommentReactionModel.aggregate([
      {
        $lookup: {
          from: 'postcomments',
          localField: 'commentId',
          foreignField: '_id',
          as: 'commentData',
        },
      },

      {
        $unwind: '$commentData',
      },
      {
        $group: {
          _id: '$commentData.postId',
          count: { $sum: 1 },
        },
      },
    ])

    const commentReactionsCountMap = {}
    commentReactionsCounts.forEach((item) => {
      commentReactionsCountMap[item._id.toString()] = item.count
    })

    UserPosts = UserPosts.map((post) => ({
      ...post,
      commentsReactionsCount: commentReactionsCountMap[post._id.toString()] || 0,
    }))

    console.log('------------>', UserPosts)
    UserPosts = await PostsModel.populate(UserPosts, [
      // {
      //   path: 'userId',
      //   model: 'Auth',
      //   select: 'fullName image',
      //   populate: 'image',
      // },
      {
        path: 'postMedia',
        model: 'Media',
      },
      {
        path: 'originalPost',
        model: 'Posts',
        select: 'postMedia postCaption postThumbnail userId',

        populate: [
          {
            path: 'postMedia',
            select: 'mediaType mediaUrl',
            model: 'Media',
          },
          {
            path: 'userId',
            select: 'fullName image',
            model: 'Auth',
            populate: 'image',
          },
        ],
      },
    ])
    return next(CustomSuccess.createSuccess(UserPosts, 'User all posts fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Get Post By Id
// @EndPoint: /api/get_post_by_id
// @Access: Private
export const getPostById = async (req, res, next) => {
  try {
    const { userId } = req
    console.log(req.userId)
    const { id } = req.query

    const Post = await PostsModel.aggregate([
      {
        $match: {
          isDeleted: false,
          _id: new Types.ObjectId(id.toString()),
          reported: { $nin: [new Types.ObjectId(userId.toString())] },
          hidePost: { $nin: [new Types.ObjectId(userId.toString())] },
        },
      },
      {
        $lookup: {
          from: 'postreactions',
          localField: '_id',
          foreignField: 'postId',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: 'userId',
                pipeline: [
                  {
                    $lookup: {
                      from: 'media',
                      localField: 'image',
                      foreignField: '_id',
                      as: 'media',
                    },
                  },
                ],
                as: 'user',
              },
            },
          ],
          as: 'reactions',
        },
      },
      {
        $lookup: {
          from: 'postcomments',
          localField: '_id',
          foreignField: 'postId',
          pipeline: [
            {
              $lookup: {
                from: 'commentreactions',
                localField: '_id',
                foreignField: 'commentId',
                pipeline: [
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'userId',
                      foreignField: 'userId',
                      pipeline: [
                        {
                          $lookup: {
                            from: 'media',
                            localField: 'image',
                            foreignField: '_id',
                            as: 'media',
                          },
                        },
                      ],
                      as: 'user',
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      reactionOn: 1,
                      reactionType: 1,
                      commentId: 1,
                      userId: 1,
                      createdAt: 1,
                      updatedAt: 1,
                      __v: 1,
                      user: {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: '$user',
                              as: 'reactionUser',
                              in: {
                                name: '$$reactionUser.name',
                                mediaUrl: {
                                  $arrayElemAt: ['$$reactionUser.media.mediaUrl', 0],
                                },
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  },
                ],
                as: 'commentreactions',
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: 'userId',
                pipeline: [
                  {
                    $lookup: {
                      from: 'media',
                      localField: 'image',
                      foreignField: '_id',
                      as: 'media',
                    },
                  },
                ],
                as: 'user',
              },
            },
            {
              $lookup: {
                from: 'replays',
                localField: '_id',
                foreignField: 'commentId',
                pipeline: [
                  { $match: { isDeleted: false } },
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'userId',
                      foreignField: 'userId',
                      pipeline: [
                        {
                          $lookup: {
                            from: 'media',
                            localField: 'image',
                            foreignField: '_id',
                            as: 'media',
                          },
                        },
                      ],
                      as: 'user',
                    },
                  },
                ],
                as: 'replay',
              },
            },
          ],
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'media',
          localField: 'postMedia',
          foreignField: '_id',
          as: 'postMediaUrl',
        },
      },
      {
        $addFields: {
          reactionsCount: { $size: '$reactions' },
          commentsCount: { $size: '$comments' },
          repliesCount: {
            $sum: {
              $map: {
                input: '$comments.replay',
                as: 'replay',
                in: { $size: '$$replay' },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          postMediaType: 1,
          isPDeleted: 1,
          postCaption: 1,
          reported: 1,
          hidePost: 1,
          postThumbnail: 1,
          isShared: 1,
          originalPost: 1,
          mediaUrl: { $arrayElemAt: ['$postMediaUrl.mediaUrl', 0] },
          userType: { $arrayElemAt: ['$postMediaUrl.userType', 0] },
          isDeleted: { $arrayElemAt: ['$postMediaUrl.isPDeleted', 0] },
          reactionsCount: 1,
          commentsCount: 1,
          repliesCount: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
          reactions: {
            $map: {
              input: '$reactions',
              as: 'reaction',
              in: {
                _id: '$$reaction._id',
                reactionOn: '$$reaction.reactionOn',
                reactionType: '$$reaction.reactionType',
                postId: '$$reaction.postId',
                userId: '$$reaction.userId',
                createdAt: '$$reaction.createdAt',
                updatedAt: '$$reaction.updatedAt',
                __v: '$$reaction.__v',
                user: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: '$$reaction.user',
                        as: 'reactionUser',
                        in: {
                          name: '$$reactionUser.name',
                          profileImage: {
                            $arrayElemAt: ['$$reactionUser.media.mediaUrl', 0],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },

          comments: {
            $map: {
              input: '$comments',
              as: 'comment',
              in: {
                _id: '$$comment._id',
                postId: '$$comment.postId',
                userId: '$$comment.userId',
                postComment: '$$comment.postComment',
                createdAt: '$$comment.createdAt',
                updatedAt: '$$comment.updatedAt',
                __v: '$$comment.__v',
                commentreactions: '$$comment.commentreactions',
                user: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: '$$comment.user',
                        as: 'commentUser',
                        in: {
                          name: '$$commentUser.name',
                          profileImage: {
                            $arrayElemAt: ['$$commentUser.media.mediaUrl', 0],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
                replay: {
                  $map: {
                    input: '$$comment.replay',
                    as: 'replayItem',
                    in: {
                      _id: '$$replayItem._id',
                      commentId: '$$replayItem.commentId',
                      userId: '$$replayItem.userId',
                      replayTo: '$$replayItem.replayTo',
                      message: '$$replayItem.message',
                      createdAt: '$$replayItem.createdAt',
                      updatedAt: '$$replayItem.updatedAt',
                      __v: '$$replayItem.__v',
                      user: {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: '$$replayItem.user',
                              as: 'replayUser',
                              in: {
                                name: '$$replayUser.name',
                                profileImage: {
                                  $arrayElemAt: ['$$replayUser.media.mediaUrl', 0],
                                },
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ])

    console.log(Post)

    if (!Post) {
      return next(CustomSuccess.ok('No Posts exist'))
    }

    return next(CustomSuccess.createSuccess(Post, 'Post by id fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Get Post By Id
// @EndPoint: /api/get_post_by_id
// @Access: Private
export const replayToComment = async (req, res, next) => {
  try {
    await replayPostValidator.validateAsync(req.body)
    const userId = req.userId
    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const checkPost = await PostsModel.findById({ _id: req.body.postId })
    const PostComment = await PostCommentModel.findById({
      _id: req.body.commentId,
    })
    if (!checkPost) {
      return next(CustomError.notFound('Post Does Not exist'))
    }
    if (!PostComment) {
      return next(CustomError.notFound('Comment Does Not exist'))
    }
    await ReplayModel.create({
      postId: req.body.postId,
      userId: userId,
      commentId: req.body.commentId,
      replayTo: req.body.replayTo,
      message: req.body.message,
    })
    return next(CustomSuccess.createSuccess(commentPost, 'Replied To Comment successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Delete Reply
// @EndPoint: /api/delete_reply
// @Access: Private
export const deleteReplay = async (req, res, next) => {
  try {
    const { id } = req.query
    if (!id) {
      return next(CustomError.badRequest('Invalid replyId'))
    }
    const replayId = id
    const userId = req.userId
    // await deleteReplayValidator.validateAsync(req.body)
    if (!checkMongooseId(replayId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }
    const checkReplay = await ReplayModel.find({
      _id: replayId,
      userId: userId,
    })
    if (!checkReplay) {
      return next(CustomError.notFound('Comment Does Not exist'))
    }
    // var deleteComment = await ReplayModel.deleteOne({
    //   _id: replayId,
    //   userId: userId,
    // })

    const deleteComment = await ReplayModel.findByIdAndUpdate(
      replayId, // Assuming replayId is the ID of the document you want to update
      { $set: { isDeleted: true } },
      { new: true },
    )

    if (!deleteComment) {
      return next(CustomError.badRequest('Invalid commentId or userId provided'))
    }
    return next(CustomSuccess.createSuccess(deleteComment, 'Reply deleted successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// @Desc: Repost Any
// @EndPoint: /api/reportAny
// @Access: Private
export const reportAny = async (req, res, next) => {
  try {
    console.log('reportAny')
    const { error } = await reportAnyValidator.validateAsync(req.body)
    if (error) {
      return next(CustomError.createError(error.message, 400))
    }
    const userId = req.userId

    const checker = await ReportModel.findOne({
      userId,
      reportedToId: req.body.reportedToId,
    })
    if (checker) {
      return next(CustomSuccess.createSuccess(checker, 'Already Reported', 208))
    }

    const report = await new ReportModel({
      userId,
      reportedToId: req.body.reportedToId,
      reportedType: req.body.reportedType,
      tag: req.body.tag,
      reason: req.body.reason,
    }).save()

    // await report.save()
    return next(CustomSuccess.createSuccess(report, 'reported successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const getReportsByType = async (req, res, next) => {
  try {
    console.log('getReportsByType')

    if (!req.params.reportedType) {
      return next(CustomError.createError('reportedType is not defined', 400))
    }

    const reports = await ReportModel.find({
      tag: req.params.reportedType,
    }).exec()

    console.log(reports)
    if (reports.length === 0) {
      return next(CustomError.createError('Not Found', 400))
    }
    return next(CustomSuccess.createSuccess(reports, 'reports fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}
export const getReportsByUser = async (req, res, next) => {
  try {
    console.log('getReportsByUser')
    const userId = req.userId

    const reports = await ReportModel.find({
      userId,
    }).exec()

    console.log(reports)
    if (reports.length === 0) {
      return next(CustomError.createError('Not Found', 400))
    }
    return next(CustomSuccess.createSuccess(reports, 'reports of user fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const getReportTag = async (req, res, next) => {
  try {
    const Tags = await ReportTagModel.find()
    return next(CustomSuccess.createSuccess(Tags, 'Tags fetched', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}
