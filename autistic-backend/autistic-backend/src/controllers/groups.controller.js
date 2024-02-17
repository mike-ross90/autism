import CustomSuccess from '../utils/responseHandlers/customSuccess.util.js'
import CustomError from '../utils/responseHandlers/customError.util.js'
import GroupModel from '../models/groups.model.js'
import { checkMongooseId } from '../services/mongooseResource.js'
import GroupRequestModel from '../models/groupRequest.model.js'
import {
  commentPostValidator,
  createPostValidator,
  deleteCommentValidator,
  deletePostValidator,
  getAllCommentsValidator,
  getReactsOnCommentsValidator,
  getReactsOnLikesValidator,
  paginationValidator,
  reactOnCommentValidator,
  reactOnPostValidator,
  // hidePostValidator,
  reportPostValidator,
  searchPostValidator,
  sharePostValidator,
  updatePostValidator,
} from '../utils/validator/groupsValidator.js'
import { generateThumbnail } from '../middleware/uploadPost.middleware.js'
import { uploadMedia } from '../utils/resources/imgResource.js'
import { unlinkSync } from 'fs'
import GroupPostsModel from '../models/groupPosts.model.js'
import mongoose, { Types } from 'mongoose'
import GroupPostReactionModel from '../models/groupPostReaction.model.js'
import GroupPostCommentModel from '../models/groupPostComment.model.js'
import GroupCommentReactionModel from '../models/groupCommentReaction.model.js'
import AuthModel from '../models/auth.model.js'

// @Desc: Get All Groups
// @EndPoint: /api/get_all_groups
// @Access: Private
export const getAllGroups = async (req, res, next) => {
  try {
    const { userType } = req
    const { page, limit } = req.query

    if (userType !== 'parent') {
      return next(CustomError.forbidden('Only parents can see groups'))
    }

    const pageNumber = parseInt(page) || 1
    const pageSize = parseInt(limit) || 10
    const skip = (pageNumber - 1) * pageSize

    const query = GroupModel.find({ isDeleted: 'false' }).aggregate([
      {
        $lookup: {
          from: 'adminmedias',
          localField: 'coverImage',
          foreignField: '_id',
          as: 'coverImageInfo',
        },
      },
      {
        $project: {
          'coverImageInfo.mediaUrl': 1,
          title: 1,
          members: 1,
          memberCount: { $size: '$members' },
        },
      },
      { $unwind: '$coverImageInfo' },
      { $skip: skip },
      { $limit: pageSize },
    ])

    const groups = await query.exec()

    return next(CustomSuccess.createSuccess(groups, 'Groups fetched successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Get Group Info By Id
// @EndPoint: /api/get_group_info/:groupId
// @Access: Private
export const getGroupInfoById = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const { userType } = req

    if (!checkMongooseId(groupId)) {
      return next(CustomError.notFound('Invalid ID'))
    }

    if (userType !== 'parent') {
      return next(CustomError.forbidden('Only parents can see group'))
    }

    const group = await GroupModel.findById(groupId)
      .populate({
        path: 'profileImage',
        select: 'mediaUrl',
      })
      .populate({
        path: 'members',
        select: 'name email image',
        populate: {
          path: 'image',
          select: 'mediaUrl',
        },
      })

    if (!group) {
      return next(CustomError.notFound('Group not found'))
    }

    const responsePayload = {
      title: group.title,
      description: group.description,
      profileImageInfo: group.profileImage ? { mediaUrl: group.profileImage.mediaUrl } : null,
      membersInfo: group.members.map((member) => ({
        name: member.name,
        email: member.email,
        imageInfo: member.image ? { mediaUrl: member.image.mediaUrl } : null,
      })),
      membersCount: group.members.length,
    }

    return next(CustomSuccess.createSuccess(responsePayload, 'Group fetched successfully', 200))
  } catch (error) {
    return next(CustomError.internal(error.message))
  }
}

// @Desc: Join Group
// @EndPoint: /api/join_group/:groupId
// @Access: Private
export const joinGroup = async (req, res, next) => {
  try {
    const { userId, userType } = req
    const { groupId } = req.params

    if (!checkMongooseId(groupId)) {
      return next(CustomError.notFound('Invalid ID'))
    }

    if (userType !== 'parent') {
      return next(CustomError.forbidden('Only parents can join groups'))
    }

    const group = await GroupModel.findById(groupId)

    if (!group) {
      return next(CustomError.notFound('Group not found'))
    }

    if (group.members.includes(userId)) {
      return next(CustomError.badRequest('User is already a member of this group'))
    }

    await GroupModel.findByIdAndUpdate(groupId, {
      $set: { isJoined: true },
      $push: { members: userId },
    })

    await GroupRequestModel.findOneAndUpdate(
      { groupId, userId },
      { $set: { isJoined: true } },
      { upsert: true },
    )

    return next(CustomSuccess.createSuccess(null, 'Successfully joined the group', 200))
  } catch (error) {
    console.log(error.message)
    return next(CustomError.internal('Internal server error'))
  }
}

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

    const { groupId } = req.params

    if (!groupId || !checkMongooseId(groupId)) {
      return next(CustomError.createError('Invalid group ID', 400))
    }

    const group = await GroupModel.findById(groupId)
    if (!group) {
      return next(CustomError.createError('Group not found', 404))
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

    const createPost = await GroupPostsModel.create({
      ...req.body,
      userId: req.userId,
      groupId,
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
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Get Group By Id
// @EndPoint: /api/get_group/:groupId
// @Access: Private
export const getGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const { userType } = req

    if (!Types.ObjectId.isValid(groupId)) {
      return next(CustomError.createError('Invalid group ID', 400))
    }

    if (userType !== 'parent') {
      return next(CustomError.forbidden('Only parents can see group posts'))
    }

    const groupInfoPipeline = [
      {
        $match: { _id: new Types.ObjectId(groupId) },
      },
      {
        $lookup: {
          from: 'adminmedias',
          localField: 'profileImage',
          foreignField: '_id',
          as: 'profileImageInfo',
        },
      },
      {
        $lookup: {
          from: 'adminmedias',
          localField: 'coverImage',
          foreignField: '_id',
          as: 'coverImageInfo',
        },
      },
      {
        $project: {
          title: 1,
          membersCount: { $size: '$members' },
          profileImage: {
            mediaUrl: { $arrayElemAt: ['$profileImageInfo.mediaUrl', 0] },
          },
          coverImage: {
            mediaUrl: { $arrayElemAt: ['$coverImageInfo.mediaUrl', 0] },
          },
        },
      },
    ]

    const groupInfo = await GroupModel.aggregate(groupInfoPipeline)

    if (!groupInfo || groupInfo.length === 0) {
      return next(CustomError.notFound('Group not found'))
    }

    const groupPosts = await GroupPostsModel.find({ groupId })
      .populate({
        path: 'postMedia',
        select: 'mediaUrl -_id',
      })
      .populate({
        path: 'userId',
        select: 'name country city state description image -_id',
      })
      .sort({ createdAt: -1 })

    if (!groupPosts || groupPosts.length === 0) {
      return next(CustomError.notFound('No posts found for the specified group'))
    }

    return next(
      CustomSuccess.createSuccess(
        { groupInfo: groupInfo[0], groupPosts },
        'Group info and posts fetched successfully',
        200,
      ),
    )
  } catch (error) {
    console.log(error.message)
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Update Post In Group
// @EndPoint: /api/update_post
// @Access: Private
export const updatePost = async (req, res, next) => {
  try {
    await updatePostValidator.validateAsync(req.body)
    // const userId = req.userId
    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.createError('Invalid id provided', 400))
    }
    const updatePost = await GroupPostsModel.findByIdAndUpdate(
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
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Search Post In Group
// @EndPoint: /api/search_post
// @Access: Private
export const searchPost = async (req, res, next) => {
  try {
    const { body, userType, userId } = req

    const { error } = await searchPostValidator.validateAsync(body)
    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    const { groupId, prompt } = body

    const isMemberOfGroup = await GroupModel.exists({
      _id: groupId,
      members: userId,
    })

    if (!isMemberOfGroup) {
      return next(new CustomError(403, 'You are not a member of this group'))
    }

    const search = await GroupPostsModel.aggregate([
      {
        $match: {
          groupId: new mongoose.Types.ObjectId(groupId),
          postCaption: new RegExp(prompt),
          isDeleted: false,
        },
      },
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

    return next(CustomSuccess.createSuccess(search, 'Posts fetched successfully', 200))
  } catch (error) {
    console.log(error.message)
    return next(new CustomError(500, 'Internal server error'))
  }
}

// @Desc: Share Post In Group
// @EndPoint: /api/share_post/
// @Access: Private
export const sharePost = async (req, res, next) => {
  try {
    await sharePostValidator.validateAsync(req.body)
    const userId = req.userId

    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }

    const { postId, groupId, postCaption } = req.body

    const checkPost = await GroupPostsModel.findOne({ _id: postId, groupId })

    if (!checkPost) {
      return next(CustomError.notFound('Post does not exist in this group'))
    }

    const sharedPost = await GroupPostsModel.create({
      postCaption,
      originalPost: postId,
      userId,
      isShared: true,
      groupId,
    })

    if (!sharedPost) {
      return next(CustomError.badRequest('Sharing failed'))
    }

    return next(CustomSuccess.createSuccess(sharedPost, 'Post Shared Successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Repost Post In Group
// @EndPoint: /api/report_post
// @Access: Private
export const reportPost = async (req, res, next) => {
  try {
    await reportPostValidator.validateAsync(req.body)
    const userId = req.userId

    if (!checkMongooseId(req.body.postId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }

    const { postId, groupId } = req.body

    const checkPost = await GroupPostsModel.findOne({ _id: postId, groupId })

    if (!checkPost) {
      return next(CustomError.createError('Post not found in this group', 200))
    }

    const isMemberOfGroup = await GroupModel.exists({
      _id: groupId,
      members: userId,
    })

    if (!isMemberOfGroup) {
      return next(CustomError.createError('You are not a member of this group', 403))
    }

    const report = await GroupPostsModel.findByIdAndUpdate(
      postId,
      { $addToSet: { reported: userId } },
      { new: true },
    )

    if (!report) {
      return next(CustomError.createError('Post not found', 200))
    }
    return next(CustomSuccess.createSuccess(report, 'Post reported successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Hide Post In Group
// @EndPoint: /api/hide_post
// @Access: Private
// export const hidePost = async (req, res, next) => {
//   try {
//     await hidePostValidator.validateAsync(req.body)
//     const userId = req.userId

//     if (!checkMongooseId(req.body.postId)) {
//       return next(CustomError.badRequest('Invalid id provided'))
//     }

//     const { postId, groupId } = req.body

//     const checkPost = await GroupPostsModel.findOne({ _id: postId, groupId })

//     if (!checkPost) {
//       return next(CustomError.createError('Post not found in this group', 200))
//     }

//     const isMemberOfGroup = await GroupModel.exists({
//       _id: groupId,
//       members: userId,
//     })

//     if (!isMemberOfGroup) {
//       return next(CustomError.createError('You are not a member of this group', 403))
//     }

//     const hide = await GroupPostsModel.findByIdAndUpdate(
//       postId,
//       { $addToSet: { hidePost: userId } },
//       { new: true },
//     )

//     if (!hide) {
//       return next(CustomError.createError('Post does not exist', 200))
//     }

//     return next(CustomSuccess.createSuccess(hide, 'Post hidden successfully', 200))
//   } catch (error) {
//     return next(CustomError.internal('Internal server error'))
//   }
// }

// @Desc: React Post In Group
// @EndPoint: /api/react_post
// @Access: Private
export const reactToPost = async (req, res, next) => {
  try {
    await reactOnPostValidator.validateAsync(req.body)

    const { postId, reactionType, groupId } = req.body

    if (!checkMongooseId(postId)) {
      return next(CustomError.createError('Invalid id provided', 400))
    }

    const checkPost = await GroupPostsModel.findOne({ _id: postId, groupId })

    if (!checkPost) {
      return next(CustomError.createError('Post not found in this group', 400))
    }

    const isMemberOfGroup = await GroupModel.exists({
      _id: groupId,
      members: req.userId,
    })

    if (!isMemberOfGroup) {
      return next(CustomError.createError('You are not a member of this group', 403))
    }

    const existingReaction = await GroupPostReactionModel.findOne({
      postId,
      userId: req.userId,
    })

    if (existingReaction) {
      const removeReaction = await GroupPostReactionModel.findOneAndRemove({
        postId,
        userId: req.userId,
      })

      return next(CustomSuccess.createSuccess(removeReaction, 'Reaction Removed Successfully', 200))
    } else {
      const reactedPost = await GroupPostReactionModel.create({
        postId,
        groupId,
        userId: req.userId,
        reactionType,
        reactionOn: 'Post',
      })

      return next(CustomSuccess.createSuccess(reactedPost, 'Post reacted successfully', 200))
    }
  } catch (error) {
    console.log(error.message)
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Comment Post In Group
// @EndPoint: /api/comment_post
// @Access: Private
export const commentPost = async (req, res, next) => {
  try {
    await commentPostValidator.validateAsync(req.body)
    const userId = req.userId

    if (!checkMongooseId(req.body.postId) || !checkMongooseId(req.body.groupId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }

    const { postId, postComment, groupId } = req.body

    const checkPost = await GroupPostsModel.findOne({ _id: postId, groupId })

    if (!checkPost) {
      return next(CustomError.notFound('Post Does Not exist in this group'))
    }

    const isMemberOfGroup = await GroupModel.exists({
      _id: groupId,
      members: userId,
    })

    if (!isMemberOfGroup) {
      return next(CustomError.forbidden('You are not a member of this group'))
    }

    // const isCommentAllowed = checkPost.isCommentAllowed

    // if (!isCommentAllowed) {
    //   return next(CustomError.forbidden('Commenting on this post is not allowed'))
    // }

    const commentPost = await GroupPostCommentModel.create({
      postId,
      groupId,
      userId,
      postComment,
    })

    return next(CustomSuccess.createSuccess(commentPost, 'Commented on post successfully', 200))
  } catch (error) {
    console.log(error.message)
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: React Comment In Group
// @EndPoint: /api/react_comment
// @Access: Private
export const reactToComment = async (req, res, next) => {
  try {
    await reactOnCommentValidator.validateAsync(req.body)

    const { commentId, reactionType, groupId } = req.body

    if (!checkMongooseId(commentId)) {
      return next(CustomError.createError('Invalid id provided', 400))
    }

    const checkComment = await GroupPostCommentModel.findOne({ _id: commentId, groupId })

    if (!checkComment) {
      return next(CustomError.createError('Comment not found in this group', 400))
    }

    const isMemberOfGroup = await GroupModel.exists({
      _id: groupId,
      members: req.userId,
    })

    if (!isMemberOfGroup) {
      return next(CustomError.createError('You are not a member of this group', 403))
    }

    const existingReaction = await GroupCommentReactionModel.findOne({
      commentId,
      userId: req.userId,
    })

    if (existingReaction) {
      const removeReaction = await GroupCommentReactionModel.findOneAndRemove({
        commentId,
        userId: req.userId,
      })

      return next(CustomSuccess.createSuccess(removeReaction, 'Reaction Removed Successfully', 200))
    } else {
      const reactedComment = await GroupCommentReactionModel.create({
        commentId,
        groupId,
        userId: req.userId,
        reactionType,
        reactionOn: 'Comment',
      })

      return next(CustomSuccess.createSuccess(reactedComment, 'Comment reacted successfully', 200))
    }
  } catch (error) {
    console.log(error.message)
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Get All Comments Of Post In Group
// @EndPoint: /api/get_all_comments
// @Access: Private
export const getAllComments = async (req, res, next) => {
  try {
    const { postId, groupId } = req.query

    await getAllCommentsValidator.validateAsync(req.query)

    if (!checkMongooseId(postId) || !checkMongooseId(groupId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }

    const checkPost = await GroupPostsModel.findOne({ _id: postId, groupId })

    if (!checkPost) {
      return next(CustomError.notFound('Post Does Not Exist in this group'))
    }

    const isMemberOfGroup = await GroupModel.exists({
      _id: groupId,
      members: req.userId,
    })

    if (!isMemberOfGroup) {
      return next(CustomError.forbidden('You are not a member of this group'))
    }

    const allComments = await GroupPostCommentModel.find({ postId }).select(
      'userId postComment -_id',
    )

    if (!allComments) {
      return next(CustomError.badRequest('Invalid postId provided'))
    }

    return next(CustomSuccess.createSuccess(allComments, 'All comments fetched successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Get Your Post In Group
// @EndPoint: /api/get_your_posts
// @Access: Private
export const getYourPost = async (req, res, next) => {
  try {
    const { userId, groupId } = req.body
    const { page } = req.query

    let UserPosts = await GroupPostsModel.aggregate([
      {
        $match: {
          isDeleted: false,
          userId: new Types.ObjectId(userId),
          groupId: new Types.ObjectId(groupId),
          reported: { $nin: [new Types.ObjectId(userId)] },
          hidePost: { $nin: [new Types.ObjectId(userId)] },
        },
      },
      {
        $lookup: {
          from: 'grouppostreactions',
          localField: '_id',
          foreignField: 'postId',
          as: 'reactions',
        },
      },
      {
        $lookup: {
          from: 'grouppostcomments',
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
        $sort: { updatedAt: 1 },
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

    const commentReactionsCounts = await GroupCommentReactionModel.aggregate([
      {
        $lookup: {
          from: 'grouppostcomments',
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

    UserPosts = await GroupPostsModel.populate(UserPosts, [
      {
        path: 'postMedia',
        model: 'Media',
      },
      {
        path: 'originalPost',
        model: 'GroupPosts',
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
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Get All Posts In Group
// @EndPoint: /api/get_all_posts
// @Access: Private
export const getAllPosts = async (req, res, next) => {
  try {
    const { page, limit, groupId } = req.body

    await paginationValidator.validateAsync(req.body)

    const user = await AuthModel.findOne({
      _id: req.userId,
    }).select('blockUsers')

    const blockUserIds = user.blockUsers.map((userId) => String(userId))

    const skip = (Number(page) - 1) * Number(limit)

    let allPosts = await GroupPostsModel.aggregate([
      {
        $match: {
          isDeleted: false,
          reported: { $nin: [new Types.ObjectId(req.userId.toString())] },
          hidePost: { $nin: [new Types.ObjectId(req.userId.toString())] },
          userId: { $nin: blockUserIds },
          groupId: new Types.ObjectId(groupId),
        },
      },
      {
        $lookup: {
          from: 'grouppostreactions',
          localField: '_id',
          foreignField: 'postId',
          as: 'likes',
        },
      },
      {
        $lookup: {
          from: 'grouppostcomments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
        },
      },
      {
        $unset: ['likes', 'comments'],
      },
      {
        $sort: { updatedAt: 1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: Number(limit),
      },
    ])

    allPosts = await GroupPostsModel.populate(allPosts, [
      {
        path: 'userId',
        model: 'Auth',
        select: 'fullName image',
        populate: 'image',
      },
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

    if (allPosts.length === 0) {
      return next(CustomSuccess.createSuccess([], 'No posts found in this group', 200))
    }

    return next(CustomSuccess.createSuccess(allPosts, 'Posts fetched successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Get All Reacts On Post In Group
// @EndPoint: /api/get_likes
// @Access: Private
export const getReactsOnPost = async (req, res, next) => {
  try {
    const { postId, groupId } = req.body
    await getReactsOnLikesValidator.validateAsync(req.body)

    if (!checkMongooseId(postId) || !checkMongooseId(groupId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }

    const listOfLikes = await GroupPostReactionModel.find({ postId, groupId })

    if (listOfLikes) {
      const listOfUsers = await GroupPostReactionModel.populate(listOfLikes, [
        {
          path: 'userId',
          model: 'Auth',
          select: 'name image',
          populate: 'image',
        },
      ])

      return next(
        CustomSuccess.createSuccess(listOfUsers, 'List of likes on Post in the group', 200),
      )
    }

    return next(CustomError.createError('Something went wrong', 400))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Get All Reacts On Comment In Group
// @EndPoint: /api/get_likes
// @Access: Private
export const getReactsOnComments = async (req, res, next) => {
  try {
    const { commentId, groupId } = req.body
    await getReactsOnCommentsValidator.validateAsync(req.body)

    if (!checkMongooseId(commentId) || !checkMongooseId(groupId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }

    const listOfComments = await GroupCommentReactionModel.find({ commentId, groupId })

    if (listOfComments) {
      const listOfUsers = await GroupCommentReactionModel.populate(listOfComments, [
        {
          path: 'userId',
          model: 'Auth',
          select: 'name image',
          populate: 'image',
        },
      ])

      return next(
        CustomSuccess.createSuccess(listOfUsers, 'List of Comments on Post in the group', 200),
      )
    }

    return next(CustomError.createError('Something went wrong', 400))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Delete Comment In Group
// @EndPoint: /api/delete_post
// @Access: Private
export const deleteComment = async (req, res, next) => {
  try {
    const { userId } = req
    const { commentId, groupId } = req.body
    await deleteCommentValidator.validateAsync(req.body)

    if (!checkMongooseId(commentId) || !checkMongooseId(groupId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }

    const checkComment = await GroupPostCommentModel.findOne({
      _id: commentId,
      userId,
      groupId,
    })

    if (!checkComment) {
      return next(CustomError.notFound('Comment Does Not exist'))
    }

    const deleteComment = await GroupPostCommentModel.deleteOne({
      _id: commentId,
      userId,
      groupId,
    })

    if (deleteComment.deletedCount == 0) {
      return next(CustomError.badRequest('Invalid commentId or userId provided'))
    }

    return next(CustomSuccess.createSuccess(deleteComment, 'Comment deleted successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc: Delete Post In Group
// @EndPoint: /api/delete_post
// @Access: Private
export const deletePost = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const userId = req.userId
    const { postId, groupId } = req.body
    await deletePostValidator.validateAsync(req.body)

    if (!checkMongooseId(postId) || !checkMongooseId(groupId)) {
      return next(CustomError.badRequest('Invalid id provided'))
    }

    const checkOwner = await GroupPostsModel.findOne(
      {
        _id: postId,
        userId,
        groupId, // Check if the post belongs to the specified group
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

    const findSharedPost = await GroupPostsModel.find(
      {
        originalPost: postId,
        isShared: true,
        groupId, // Check if shared posts belong to the specified group
      },
      null,
      {
        session,
      },
    )

    if (findSharedPost.length > 0) {
      await GroupPostsModel.updateMany(
        { originalPost: postId, groupId },
        { $set: { originalPost: null } },
        {
          session,
          new: true,
          upsert: true,
        },
      )
    }

    const originalPost = await GroupPostsModel.findOneAndDelete(
      { _id: postId, userId, groupId }, // Ensure the post belongs to the specified group
      {
        session,
        new: true,
      },
    )

    const deleteLikes = await GroupPostReactionModel.deleteMany({
      postId,
      groupId,
    }) // Ensure likes belong to the specified group

    if (!deleteLikes) {
      await session.abortTransaction()
      return next(CustomError.badRequest('Likes Not removed'))
    }

    const deleteComments = await GroupPostCommentModel.deleteMany({
      postId,
      groupId, // Ensure comments belong to the specified group
    })

    if (!deleteComments) {
      await session.abortTransaction()
      return next(CustomError.notFound('Comments Not removed'))
    }

    if (originalPost) {
      await session.commitTransaction()
      return next(CustomSuccess.createSuccess(originalPost, 'Original Post Deleted', 200))
    }

    await session.abortTransaction()
    return next(CustomError.createError('Something went wrong', 400))
  } catch (error) {
    await session.abortTransaction()
    console.log(error.message)
    return next(CustomError.internal('Internal server error'))
  } finally {
    await session.endSession()
  }
}
