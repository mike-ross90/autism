import CustomSuccess from '../utils/responseHandlers/customSuccess.util.js'
import CustomError from '../utils/responseHandlers/customError.util.js'
import { checkMongooseId } from '../services/mongooseResource.js'
import { adminUploadMedia } from '../utils/resources/adminImgResource.js'
import AdminModel from '../models/admin.model.js'
import ExpertiseModel from '../models/expertise.model.js'
import AuthModel from '../models/auth.model.js'
import GroupModel from '../models/groups.model.js'
import ProfileModel from '../models/profile.model.js'
import PolicyModel from '../models/policy.model.js'
import ActionModel from '../models/action.model.js'
import ReportTagModel from '../models/reportTags.model.js'
import ReportModel from '../models/report.model.js'
import PostsModel from '../models/posts.model.js'

import PostCommentModel from '../models/postComment.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import PostReactionModel from '../models/postReaction.model.js'
import MediaModel from '../models/media.model.js'
import { Types } from 'mongoose'
const secretKey = 'adminSecret'
const tokenExpiration = '24h'

export const adminLogin = async (req, res, next) => {
  const { email, password } = req.body

  console.log('testing adminLogig')

  try {
    const adminUser = await AdminModel.findOne({ email })

    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const passwordMatch = await bcrypt.compare(password, adminUser.password)

    if (passwordMatch) {
      const adminToken = jwt.sign({ userType: 'admin' }, secretKey, { expiresIn: tokenExpiration })
      return res.status(200).json({ adminToken })
    } else {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const adminRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    const existingAdmin = await AdminModel.findOne({ email })

    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newAdmin = new AdminModel({
      name,
      email,
      userType: 'admin',
      password: hashedPassword,
    })

    await newAdmin.save()

    res.status(201).json({ message: 'Admin registered successfully' })
  } catch (error) {
    console.error('Error registering admin:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const createExpertise = async (req, res, next) => {
  try {
    const expertiseData = req.body
    const createExpertise = await ExpertiseModel.create(expertiseData)

    return next(CustomSuccess.createSuccess(createExpertise, 'Expertise created successfully', 201))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// export const getAllSkillsByUsertype = async (req, res, next) => {
//   try {
//     let { userType, page, limit } = req.query

//     page = page ? parseInt(page) : 1
//     limit = limit ? parseInt(limit) : 10

//     const expertise = await ExpertiseModel.findOne({ userType })

//     if (!expertise) {
//       return next(CustomError.notFound('User type not found in expertise database'))
//     }

//     // const skillsCount = await ExpertiseModel.countDocuments({ userType })

//     const skip = (page - 1) * limit

//     const skills = await ExpertiseModel.find({ userType }, 'skill').skip(skip).limit(limit)

//     const getAllSkills = skills.map((skill) => skill.skill)

//     const response = {
//       skills: getAllSkills,
//       // page,
//       // limit,
//       // totalSkills: skillsCount,
//     }

//     return next(CustomSuccess.createSuccess(response, 'Skills retrieved successfully', 200))
//   } catch (error) {
//     return next(CustomError.internal('Internal server error'))
//   }
// }

export const getAllSkillsByUsertype = async (req, res, next) => {
  try {
    const { userType } = req.query

    const expertise = await ExpertiseModel.findOne({ userType })
    if (!expertise) {
      return next(CustomError.notFound('User type not found in expertise database'))
    }

    const skills = await ExpertiseModel.find({ userType }).select('skill')

    return next(CustomSuccess.createSuccess(skills, 'Skills retrieved successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

export const deleteSkillById = async (req, res, next) => {
  try {
    const { body } = req
    await ExpertiseModel.findByIdAndDelete({ _id: body.skillId }, { new: true })
    return next(CustomSuccess.createSuccess('', 'Skill deleted successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const updateSkill = async (req, res, next) => {
  try {
    const { skillId } = req.query
    const { skill } = req.body

    if (!checkMongooseId(skillId)) {
      return next(CustomError.notFound('Invalid ID'))
    }

    const updatedExpertise = await ExpertiseModel.findByIdAndUpdate(
      skillId,
      { skill },
      { new: true },
    )

    if (!updatedExpertise) {
      return next(CustomError.notFound('Expertise not found'))
    }

    return next(CustomSuccess.createSuccess(updatedExpertise, 'Skill updated successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

export const getAllParents = async (req, res, next) => {
  try {
    // const { page, limit } = req.query

    // const pageNumber = page ? parseInt(page) : 1
    // const pageSize = limit ? parseInt(limit) : 10

    // const skip = (pageNumber - 1) * pageSize

    // const parents = await AuthModel.find({ userType: 'parent' }).skip(skip).limit(pageSize)
    const parents = await AuthModel.find({ userType: 'parent' })
      .select('name isVerified email isBlocked city state image updatedAt')
      .sort({ updatedAt: -1 })

    // const payload = parents.map((user) => ({
    //   name: user.name,
    //   isVerified: user.isVerified,
    //   email: user.email,
    //   isBlocked: user.isBlocked,
    //   country: user.country,
    //   city: user.city,
    //   state: user.state,
    //   image: user.image,
    // }))

    return next(CustomSuccess.createSuccess(parents, 'Parents retrieved successfully', 200))
  } catch (error) {
    console.log(error.message)
    return next(CustomError.internal('Internal server error'))
  }
}

// export const getAllExperts = async (req, res, next) => {
//   try {
//     const users = await ProfileModel.find()
//       .sort({ createdAt: -1 })
//       .populate({
//         path: 'userId',
//         select: 'email name isVerified isBlocked userType',
//       })
//       .populate({
//         path: 'image',
//         select: 'mediaUrl -_id',
//       })
//       .populate({
//         path: 'expertise',
//         select: 'skill -_id',
//       });

//     const payload = users.map((user) => ({
//         _id: user.userId._id,
//         email: user.userId.email,
//         name: user.userId.name,
//         isVerified: user.userId.isVerified,
//         isBlocked: user.userId.isBlocked,
//         userType: user.userId.userType,
//         image: user.image ? user.image.mediaUrl : null,
//         expertise: user.expertise.map((exp) => exp.skill),
//     }));

//     return next(CustomSuccess.createSuccess(payload, 'Experts retrieved successfully', 200));
//   } catch (error) {
//     console.log(error.message);
//     return next(CustomError.internal('Internal server error'));
//   }
// };

export const getAllExperts = async (req, res, next) => {
  try {
    let query = {} // Empty query object initially

    const { userType } = req.query

    if (userType) {
      query = { userType } // If userType is provided, set the query to filter by userType
    }

    const users = await AuthModel.find(query) // Find users based on the query

    const userIds = users.map((user) => user._id) // Extract user IDs

    const experts = await ProfileModel.find({ userId: { $in: userIds } })
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: 'email name isVerified isBlocked userType',
      })
      .populate({
        path: 'image',
        select: 'mediaUrl -_id',
      })
      .populate({
        path: 'expertise',
        select: 'skill -_id',
      })

    const payload = experts.map((user) => ({
      _id: user.userId._id,
      email: user.userId.email,
      name: user.userId.name,
      isVerified: user.userId.isVerified,
      isBlocked: user.userId.isBlocked,
      userType: user.userId.userType,
      image: user.image ? user.image.mediaUrl : null,
      expertise: user.expertise.map((exp) => exp.skill),
    }))

    return next(CustomSuccess.createSuccess(payload, 'Experts retrieved successfully', 200))
  } catch (error) {
    console.log(error.message)
    return next(CustomError.internal('Internal server error'))
  }
}

export const blockUserById = async (req, res, next) => {
  try {
    const { userId } = req.params

    if (!checkMongooseId(userId)) {
      return next(CustomError.notFound('Invalid ID'))
    }

    const block = await AuthModel.findOneAndUpdate(
      { _id: userId },
      { $set: { isBlocked: true } },
      { new: true },
    )

    if (!block) {
      return next(CustomError.notFound('User not found'))
    }

    return next(CustomSuccess.createSuccess(block, 'User blocked successfully', 201))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

export const getAllBlockedUsers = async (req, res, next) => {
  try {
    const { userType, page, limit } = req.query

    const pageNumber = page ? parseInt(page) : 1
    const pageSize = limit ? parseInt(limit) : 10

    const skip = (pageNumber - 1) * pageSize

    const query = { isBlocked: true }

    if (userType) {
      query.userType = userType
    }

    const users = await AuthModel.find(query, 'name email isBlocked').skip(skip).limit(pageSize)

    // const totalUsers = await AuthModel.countDocuments(query)

    const payload = users.map((user) => ({
      name: user.name,
      email: user.email,
      isBlocked: user.isBlocked,
    }))

    const response = {
      blockedUsers: payload,
      // page: pageNumber,
      // limit: pageSize,
      // totalUsers,
    }

    return next(CustomSuccess.createSuccess(response, 'Blocked Users retrieved successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

export const createGroup = async (req, res, next) => {
  try {
    const { title, description } = req.body

    const profileImage = req.files.profileImage[0]
    const coverImage = req.files.coverImage[0]

    const profileImageId = await adminUploadMedia(profileImage, 'image')
    const coverImageId = await adminUploadMedia(coverImage, 'image')

    const createGroup = await new GroupModel({
      title,
      description,
      profileImage: profileImageId,
      coverImage: coverImageId,
    }).save()

    return next(CustomSuccess.createSuccess(createGroup, 'Group creation successful', 200))
  } catch (error) {
    console.error(error.message)
    if (error.code === 11000) {
      return next(CustomError.createError('Duplicate keys not allowed', 409))
    }
    return next(CustomError.createError(error.message, 400))
  }
}

export const getAllGroups = async (req, res, next) => {
  try {
    const groups = await GroupModel.find({ isDeleted: 'false' })
      .populate({
        path: 'profileImage',
        select: '-_id mediaUrl',
      })
      .populate({
        path: 'coverImage',
        select: '-_id mediaUrl',
      })
    if (!groups) {
      return next(CustomError.notFound('Groups not found or empty'))
    }

    const payload = groups.map((group) => ({
      _id: group._id,
      title: group.title,
      description: group.description,
      profileImage: group.profileImage.mediaUrl,
      coverImage: group.coverImage.mediaUrl,
      isDeleted: group.isDeleted,
      members: group.members,
    }))

    return next(CustomSuccess.createSuccess(payload, 'All groups fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const updateGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.params
    const { body } = req

    let updateGroup = null

    if (!req.file) {
      updateGroup = await GroupModel.findOneAndUpdate(
        { _id: groupId },
        {
          title: body.title,
          description: body.description,
        },
        { returnDocument: 'after' },
      )
    } else {
      const profilePic = req?.file?.profileImage
      const coverPic = req?.file?.coverImage
      updateGroup = await GroupModel.findOneAndUpdate(
        { _id: groupId },
        {
          title: body.title,
          description: body.description,
          profileImage: profilePic,
          coverImage: coverPic,
        },
        { returnDocument: 'after' },
      )
    }

    if (updateGroup) {
      return next(CustomSuccess.createSuccess(updateGroup, 'Group updated successfully', 200))
    }
    return next(CustomError.badRequest('Group not updated'))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const deleteGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.body

    const group = await GroupModel.findByIdAndUpdate(groupId, { isDeleted: 'true' })
    if (!group) {
      return next(CustomError.notFound('Group not found'))
    }

    return next(CustomSuccess.createSuccess('', 'Group deleted successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const getGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.body
    const group = await GroupModel.findById(groupId)
    if (!group) {
      return next(CustomError.notFound('Group not found'))
    }

    return next(CustomSuccess.createSuccess(group, 'Group fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const createAbout = async (req, res, next) => {
  try {
    const { content } = req.body
    const existingAbout = await PolicyModel.findOne({ type: 'about' })

    if (existingAbout) {
      existingAbout.content = content
      const updatedAbout = await existingAbout.save()
      return next(CustomSuccess.createSuccess(updatedAbout, 'App about updated successfully', 200))
    } else {
      const about = new PolicyModel({ type: 'about', content })
      const result = await about.save()
      return next(CustomSuccess.createSuccess(result, 'App about created successfully', 200))
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const deleteAbout = async (req, res, next) => {
  try {
    const result = await PolicyModel.findOneAndDelete({ type: 'about' }, { new: true })
    return next(CustomSuccess.createSuccess(result, 'App about deleted successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const createTerms = async (req, res, next) => {
  try {
    const { content } = req.body
    const existingTerms = await PolicyModel.findOne({ type: 'terms' })

    if (existingTerms) {
      existingTerms.content = content
      const updatedTerms = await existingTerms.save()
      return next(
        CustomSuccess.createSuccess(updatedTerms, 'Terms and conditions updated successfully', 200),
      )
    } else {
      const terms = new PolicyModel({ type: 'terms', content })
      const result = await terms.save()
      return next(
        CustomSuccess.createSuccess(result, 'Terms and conditions created successfully', 200),
      )
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const deleteTerms = async (req, res, next) => {
  try {
    const result = await PolicyModel.findOneAndDelete({ type: 'terms' }, { new: true })
    return next(
      CustomSuccess.createSuccess(result, 'Terms and conditions deleted successfully', 200),
    )
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const createPrivacy = async (req, res, next) => {
  try {
    const { content } = req.body
    const existingPrivacy = await PolicyModel.findOne({ type: 'privacy' })

    if (existingPrivacy) {
      existingPrivacy.content = content
      const updatedPrivacy = await existingPrivacy.save()
      return next(
        CustomSuccess.createSuccess(updatedPrivacy, 'Privacy policy updated successfully', 200),
      )
    } else {
      const privacy = new PolicyModel({ type: 'privacy', content })
      const result = await privacy.save()
      return next(CustomSuccess.createSuccess(result, 'Privacy policy created successfully', 200))
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const deletePrivacy = async (req, res, next) => {
  try {
    const result = await PolicyModel.findOneAndDelete({ type: 'privacy' }, { new: true })
    return next(CustomSuccess.createSuccess(result, 'Privacy policy deleted successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const createAction = async (req, res, next) => {
  try {
    const image = req.file
    const imageUrl = await adminUploadMedia(image, 'image')
    req.body.image = imageUrl

    if (!req.body.image) {
      return next(CustomError.badRequest('Please Select Action image'))
    }

    const action = await new ActionModel({
      title: req.body.title,
      image: imageUrl,
    }).save()

    return next(CustomSuccess.createSuccess(action, 'Action created successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const getActions = async (req, res, next) => {
  try {
    const actions = await ActionModel.find().select('action _id').populate({
      path: 'image',
      select: 'mediaUrl -_id',
    })

    if (!actions || actions.length === 0) {
      return next(CustomSuccess.createSuccess({}, 'Actions are empty', 200))
    }

    return next(CustomSuccess.createSuccess(actions, 'Actions fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const getAbout = async (req, res, next) => {
  try {
    const about = await PolicyModel.findOne({ type: 'about' })

    return next(CustomSuccess.createSuccess(about, 'About app fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const getTerms = async (req, res, next) => {
  try {
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
    const privacy = await PolicyModel.findOne({ type: 'privacy' })

    return next(CustomSuccess.createSuccess(privacy, 'Privacy policy fetched successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const analytics = async (req, res, next) => {
  try {
    const { userType } = req.query
    let data
    if (userType) {
      data = await AuthModel.aggregate([
        {
          $match: {
            userType,
          },
        },
        {
          $group: {
            _id: '$userType', // Group by userType
            count: { $sum: 1 },
          },
        },
      ])
    } else {
      data = await AuthModel.aggregate([
        {
          $group: {
            _id: '$userType', // Group by userType
            count: { $sum: 1 },
          },
        },
      ])
    }

    return next(CustomSuccess.createSuccess(data, ' retrieved successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}
export const createReportTag = async (req, res, next) => {
  try {
    const { tag } = req.body
    if (!tag) {
      return next(CustomError.createError('Tag is not Defined', 204))
    }
    const newTag = await new ReportTagModel({
      tag,
    }).save()

    return next(CustomSuccess.createSuccess(newTag, 'newTag created successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const editReportTag = async (req, res, next) => {
  try {
    const { tag, id } = req.body
    // const {id} = req.params.id
    if (!tag || !id) {
      return next(CustomError.notFound('Invalid ID or Report Type'))
    }
    const editedTag = await ReportTagModel.findByIdAndUpdate(id, { tag }, { new: true })

    return next(CustomSuccess.createSuccess(editedTag, 'Tag edited successfully', 200))
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

export const getReportsByTag = async (req, res, next) => {
  try {
    console.log('getReportsByTag')

    if (!req.params.reportedTag) {
      return next(CustomError.createError('reportedTag is not defined', 400))
    }

    const reports = await ReportModel.find({
      tag: req.params.reportedTag,
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

// export const getReportsByType = async (req, res, next) => {
//   try {
//     const { reportedType } = req.params
//     if (!reportedType || !['Post', 'Comment', 'Reply'].includes(reportedType)) {
//       return next(CustomError.notFound('Invalid or missing reportedType'))
//     }

//     const reports = await ReportModel.find({ reportedType })
//     console.log('reports')
//     console.log(reports)

//     // Object to store unique reportedToIds
//     const uniqueReportedToIds = {}

//     const populatedReports = []

//     for (const report of reports) {
//       let populatedReport
//       if (report.reportedType === 'Post') {
//         if (!uniqueReportedToIds[report.reportedToId.toString()]) {
//           const post = await PostsModel.findById(report.reportedToId)
//             .select('postCaption')
//             .populate({
//               path: 'postMedia',
//               select: 'mediaUrl',
//             })
//             .populate({ path: 'userId', select: 'name email' })

//           const count = await ReportModel.aggregate([
//             {
//               $match: { reportedToId: report.reportedToId },
//             },
//             {
//               $lookup: {
//                 from: 'postcomments',
//                 let: { postId: '$reportedToId' }, // Define a variable postId
//                 pipeline: [
//                   {
//                     $match: { $expr: { $eq: ['$postId', '$$postId'] } }, // Match post comments with the postId
//                   },
//                 ],
//                 as: 'comments',
//               },
//             },
//             {
//               $lookup: {
//                 from: 'postreactions',
//                 let: { postId: '$reportedToId' }, // Define a variable postId
//                 pipeline: [
//                   {
//                     $match: { $expr: { $eq: ['$postId', '$$postId'] } }, // Match post reactions with the postId
//                   },
//                 ],
//                 as: 'likes',
//               },
//             },
//             {
//               $group: {
//                 _id: '$reportedToId',
//                 count: { $sum: 1 }, // Count the number of reports
//                 commentsCount: { $sum: { $size: '$comments' } }, // Count the number of comments
//                 reactionsCount: { $sum: { $size: '$likes' } }, // Count the number of likes
//               },
//             },
//           ])

//           populatedReport = {
//             _id: report._id,
//             reportedToId: report.reportedToId,
//             mediaUrl: post.postMedia[0].mediaUrl,
//             createdBy: post.userId.email,
//             postCaption: post.postCaption,
//             count: count[0].count,
//             comments: count[0].commentsCount,
//             likes: count[0].reactionsCount,
//           }

//           // Mark reportedToId as seen
//           uniqueReportedToIds[report.reportedToId.toString()] = true

//           populatedReports.push(populatedReport)

//           return next(
//             CustomSuccess.createSuccess(populatedReports, 'Report fetched successfully', 200),
//           )
//         }
//       } else if (report.reportedType === 'Comment') {
//         const commentReports = await ReportModel.aggregate([
//           {
//             $match: {
//               reportedToId: report.reportedToId,
//             },
//           },
//           {
//             $lookup: {
//               from: 'postcomments',
//               localField: 'reportedToId',
//               foreignField: '_id',
//               as: 'comment',
//             },
//           },
//           {
//             $lookup: {
//               from: 'posts',
//               localField: 'comment.postId',
//               foreignField: '_id',
//               as: 'post',
//             },
//           },
//           {
//             $lookup: {
//               from: 'media',
//               localField: 'post.postMedia',
//               foreignField: '_id',
//               as: 'media',
//             },
//           },
//           {
//             $lookup: {
//               from: 'auths',
//               localField: 'post.userId',
//               foreignField: '_id',
//               as: 'auth',
//             },
//           },
//           {
//             $project: {
//               reportedToId: 1,
//               creator: { $arrayElemAt: ['$auth.email', 0] },
//               // userId: 1,
//               comment: { $arrayElemAt: ['$comment.postComment', 0] },
//               post: { $arrayElemAt: ['$post.postCaption', 0] },
//               media: { $arrayElemAt: ['$media.mediaUrl', 0] },
//             },
//           },
//           {
//             $group: {
//               _id: '$reportedToId',
//               count: { $sum: 1 },
//               reports: { $push: '$$ROOT' },
//             },
//           },
//         ])

//         if (!commentReports) {
//           CustomSuccess.createSuccess([], 'Comment Reports not found', 200)
//         }
//         return next(
//           CustomSuccess.createSuccess(commentReports, 'Comment Reports fetched successfully', 200),
//         )

//         // populatedReports.push(populatedReport)
//       }
//       // else {
//       //   populatedReport = await PostCommentModel.findById(report.reportedToId)
//       //   populatedReports.push(populatedReport)
//       // }
//     }
//   } catch (error) {
//     return next(CustomError.createError(error.message, 400))
//   }
// }

export const getReportsByType = async (req, res, next) => {
  try {
    const { reportedType } = req.params
    if (reportedType === 'Comment') {
      const commentReports = await ReportModel.aggregate([
        {
          $match: {
            reportedType: reportedType,
          },
        },
        {
          $group: {
            _id: '$reportedToId',
            reports: { $addToSet: '$$ROOT' },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'postcomments',
            localField: '_id',
            foreignField: '_id',
            as: 'comment',
          },
        },
        {
          $unwind: '$comment',
        },
        {
          $lookup: {
            from: 'auths',
            localField: 'comment.userId',
            foreignField: '_id',
            as: 'auth',
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: 'comment.postId',
            foreignField: '_id',
            as: 'post',
          },
        },
        {
          $lookup: {
            from: 'postreactions',
            localField: 'post._id',
            foreignField: 'postId',
            as: 'likes',
          },
        },
        {
          $lookup: {
            from: 'postcomments',
            localField: 'post._id',
            foreignField: 'postId',
            as: 'postcomments',
          },
        },
        {
          $lookup: {
            from: 'media',
            localField: 'post.postMedia',
            foreignField: '_id',
            as: 'media',
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
            reportedToId: 1,
            comment: '$comment.postComment',
            mediaUrl: { $arrayElemAt: ['$media.mediaUrl', 0] },
            postCaption: { $arrayElemAt: ['$post.postCaption', 0] },
            createdBy: { $arrayElemAt: ['$auth.email', 0] },
            reports: { $arrayElemAt: ['$reports.reportedToId', 0] },
            likes: { $size: '$likes' },
            comments: { $size: '$postcomments' },
          },
        },
      ])
      if (commentReports.length < 0) {
        CustomSuccess.createSuccess([], 'Comment reports not found', 200)
      }
      return next(
        CustomSuccess.createSuccess(commentReports, 'Comment reports fetched successfully', 200),
      )
    } else if (reportedType === 'Post') {
      const postReports = await ReportModel.aggregate([
        {
          $match: {
            reportedType: reportedType,
          },
        },
        {
          $group: {
            _id: '$reportedToId',
            reports: { $addToSet: '$$ROOT' },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: '_id',
            as: 'post',
          },
        },
        {
          $lookup: {
            from: 'auths',
            localField: 'reports.userId',
            foreignField: '_id',
            as: 'createdBy',
          },
        },
        {
          $lookup: {
            from: 'media',
            localField: 'post.postMedia',
            foreignField: '_id',
            as: 'media',
          },
        },
        {
          $lookup: {
            from: 'postreactions',
            localField: 'reports.reportedToId',
            foreignField: 'postId',
            as: 'likes',
          },
        },
        {
          $lookup: {
            from: 'postcomments',
            localField: 'reports.reportedToId',
            foreignField: 'postId',
            as: 'postcomments',
          },
        },

        {
          $project: {
            count: 1,
            mediaUrl: { $arrayElemAt: ['$media.mediaUrl', 0] },
            createdBy: { $arrayElemAt: ['$createdBy.email', 0] },
            postCaption: { $arrayElemAt: ['$post.postCaption', 0] },
            likes: { $size: '$likes' },
            comments: { $size: '$postcomments' },
          },
        },
      ])

      if (postReports.length < 0) {
        CustomSuccess.createSuccess([], 'Post reports not found', 200)
      }
      return next(
        CustomSuccess.createSuccess(postReports, 'Post reports fetched successfully', 200),
      )
    } else if (reportedType === 'Reply') {
      const ReplyReports = await ReportModel.aggregate([
        {
          $match: {
            reportedType: reportedType,
          },
        },
        {
          $group: {
            _id: '$reportedToId',
            reports: { $addToSet: '$$ROOT' },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'replays',
            localField: '_id',
            foreignField: '_id',
            as: 'reply',
          },
        },
        {
          $lookup: {
            from: 'postcomments',
            localField: 'reply.commentId',
            foreignField: '_id',
            as: 'comment',
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: 'comment.postId',
            foreignField: '_id',
            as: 'post',
          },
        },
        {
          $lookup: {
            from: 'media',
            localField: 'post.postMedia',
            foreignField: '_id',
            as: 'media',
          },
        },
        {
          $lookup: {
            from: 'postreactions',
            localField: 'post._id',
            foreignField: 'postId',
            as: 'likes',
          },
        },
        {
          $lookup: {
            from: 'postcomments',
            localField: 'post._id',
            foreignField: 'postId',
            as: 'postcomments',
          },
        },
        {
          $lookup: {
            from: 'auths',
            localField: 'reply.userId',
            foreignField: '_id',
            as: 'auth',
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
            reportedToId: 1,
            mediaUrl: { $arrayElemAt: ['$media.mediaUrl', 0] },
            comment: { $arrayElemAt: ['$comment.postComment', 0] },
            createdBy: { $arrayElemAt: ['$auth.email', 0] },
            reply: { $arrayElemAt: ['$reply.message', 0] },
            postCaption: { $arrayElemAt: ['$post.postCaption', 0] },
            likes: { $size: '$likes' },
            comments: { $size: '$postcomments' },
          },
        },
      ])

      if (ReplyReports.length < 0) {
        CustomSuccess.createSuccess([], 'Reply reports not found', 200)
      }
      return next(
        CustomSuccess.createSuccess(ReplyReports, 'Reply reports fetched successfully', 200),
      )
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}

// export const getFullReportById = async (req, res, next) => {
//   try {
//     const { id } = req.params

//     const reports = await ReportModel.find({ reportedToId: id })

//     const data = {
//       Report: [],
//       media: null,
//       Post: null,
//       likes: 0,
//       comments: 0,
//     }

//     if (reports.length === 0) {
//       return next(CustomError.createError('No reports found', 404))
//     }

//     if (reports[0].reportedType === 'Post') {
//       const postIds = reports.map((report) => report.reportedToId)
//       data.Post = await PostsModel.find({ _id: { $in: postIds } }).select('postCaption postMedia')
//       const meda = await MediaModel.findById(data.Post[0].postMedia[0]).select('mediaUrl')
//       data.Post = data.Post[0].postCaption
//       data.media = meda
//       data.likes = await PostReactionModel.countDocuments({ postId: { $in: postIds } })
//       data.comments = await PostCommentModel.countDocuments({ postId: { $in: postIds } })
//     }

//     // Fetch user details and media for each report
//     const userDetailsPromises = reports.map(async (report) => {
//       const user = await AuthModel.findById(report.userId).select('email name')
//       const media = await MediaModel.findOne({ userId: report.userId }).select('mediaUrl')
//       return { email: user.email, name: user.name, media: media ? media.mediaUrl : null }
//     })

//     // Wait for all promises to resolve
//     const userDetails = await Promise.all(userDetailsPromises)

//     // Merge user details into each report object
//     data.Report = reports.map((report, index) => ({
//       ...report.toObject(),
//       user: userDetails[index],
//     }))

//     return next(CustomSuccess.createSuccess(data, 'Reports fetched successfully', 200))
//   } catch (error) {
//     return next(CustomError.createError(error.message, 400))
//   }
// }

export const getFullReportById = async (req, res, next) => {
  try {
    const { id, type } = req.query
    console.log(id)

    if (type === 'Post') {
      const postReport = await ReportModel.aggregate([
        {
          $match: {
            reportedToId: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'auths',
            localField: 'userId',
            foreignField: '_id',
            as: 'auth',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'user',
          },
        },
        {
          $lookup: {
            from: 'media',
            localField: 'userId',
            foreignField: 'userId',
            as: 'image',
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: 'reportedToId',
            foreignField: '_id',
            as: 'post',
          },
        },
        {
          $lookup: {
            from: 'media',
            localField: 'post.postMedia',
            foreignField: '_id',
            as: 'media',
          },
        },
        {
          $lookup: {
            from: 'postreactions',
            localField: 'post._id',
            foreignField: 'postId',
            as: 'likes',
          },
        },
        {
          $lookup: {
            from: 'postcomments',
            localField: 'post._id',
            foreignField: 'postId',
            as: 'postcomments',
          },
        },
        {
          $project: {
            tag: 1,
            email: { $arrayElemAt: ['$auth.email', 0] },
            name: { $arrayElemAt: ['$user.name', 0] },
            image: { $arrayElemAt: ['$image.mediaUrl', 0] },
            postCaption: { $arrayElemAt: ['$post.postCaption', 0] },
            mediaUrl: { $arrayElemAt: ['$media.mediaUrl', 0] },
            likes: { $size: '$likes' },
            comments: { $size: '$postcomments' },
          },
        },
      ])

      if (!postReport) {
        return next(CustomSuccess.createSuccess([], 'Post reports not found', 200))
      }
      return next(CustomSuccess.createSuccess(postReport, 'Post reports fetched successfully', 200))
    } else if (type === 'Comment') {
      const commentReport = await ReportModel.aggregate([
        {
          $match: {
            reportedToId: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'auths',
            localField: 'userId',
            foreignField: '_id',
            as: 'auth',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'user',
          },
        },
        {
          $lookup: {
            from: 'media',
            localField: 'userId',
            foreignField: 'userId',
            as: 'image',
          },
        },
        {
          $lookup: {
            from: 'postcomments',
            localField: 'reportedToId',
            foreignField: '_id',
            as: 'comment',
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: 'comment.postId',
            foreignField: '_id',
            as: 'post',
          },
        },
        {
          $lookup: {
            from: 'media',
            localField: 'post.postMedia',
            foreignField: '_id',
            as: 'media',
          },
        },
        {
          $lookup: {
            from: 'postreactions',
            localField: 'post._id',
            foreignField: 'postId',
            as: 'likes',
          },
        },
        {
          $lookup: {
            from: 'postcomments',
            localField: 'post._id',
            foreignField: 'postId',
            as: 'postcomments',
          },
        },
        {
          $project: {
            tag: 1,
            email: { $arrayElemAt: ['$auth.email', 0] },
            name: { $arrayElemAt: ['$user.name', 0] },
            image: { $arrayElemAt: ['$image.mediaUrl', 0] },
            comment: { $arrayElemAt: ['$comment.postComment', 0] },
            mediaUrl: { $arrayElemAt: ['$media.mediaUrl', 0] },
            post: { $arrayElemAt: ['$post.postCaption', 0] },
            likes: { $size: '$likes' },
            comments: { $size: '$postcomments' },
          },
        },
      ])
      if (!commentReport) {
        return next(CustomSuccess.createSuccess([], 'Post reports not found', 200))
      }
      return next(
        CustomSuccess.createSuccess(commentReport, 'Post reports fetched successfully', 200),
      )
    } else if (type === 'Reply') {
      const replyReport = await ReportModel.aggregate([
        {
          $match: {
            reportedToId: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'auths',
            localField: 'userId',
            foreignField: '_id',
            as: 'auth',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'user',
          },
        },
        {
          $lookup: {
            from: 'media',
            localField: 'userId',
            foreignField: 'userId',
            as: 'image',
          },
        },
        {
          $lookup: {
            from: 'replays',
            localField: 'reportedToId',
            foreignField: '_id',
            as: 'reply',
          },
        },
        {
          $lookup: {
            from: 'postcomments',
            localField: 'reply.commentId',
            foreignField: '_id',
            as: 'comment',
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: 'comment.postId',
            foreignField: '_id',
            as: 'post',
          },
        },
        {
          $lookup: {
            from: 'media',
            localField: 'post.postMedia',
            foreignField: '_id',
            as: 'media',
          },
        },
        {
          $lookup: {
            from: 'postreactions',
            localField: 'post._id',
            foreignField: 'postId',
            as: 'likes',
          },
        },
        {
          $lookup: {
            from: 'postcomments',
            localField: 'post._id',
            foreignField: 'postId',
            as: 'postcomments',
          },
        },
        {
          $project: {
            tag: 1,
            email: { $arrayElemAt: ['$auth.email', 0] },
            name: { $arrayElemAt: ['$user.name', 0] },
            image: { $arrayElemAt: ['$image.mediaUrl', 0] },
            reply: { $arrayElemAt: ['$reply.message', 0] },
            comment: { $arrayElemAt: ['$comment.postComment', 0] },
            post: { $arrayElemAt: ['$post.postCaption', 0] },
            mediaUrl: { $arrayElemAt: ['$media.mediaUrl', 0] },
            likes: { $size: '$likes' },
            comments: { $size: '$postcomments' },
          },
        },
      ])
      if (!replyReport) {
        return next(CustomSuccess.createSuccess([], 'Reply reports not found', 200))
      }
      return next(
        CustomSuccess.createSuccess(replyReport, 'Reply reports fetched successfully', 200),
      )
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 400))
  }
}
