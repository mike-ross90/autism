import joi from 'joi'

export const createPostValidator = joi.object({
  userId: joi.string().required(),
  postCaption: joi.string(),
  postMediaType: joi.string().valid('image', 'video').required().messages({
    // 'any.required': 'File type is required.',
    'any.only': 'File type must be either image or video.',
  }),
  //   postMediaType: joi.string().equal('image', 'video').required(),
})

export const reportPostValidator = joi.object({
  postId: joi.string().required(),
})

export const hidePostValidator = joi.object({
  postId: joi.string().required(),
})

export const updatePostValidator = joi.object({
  postId: joi.string().required(),
  postCaption: joi.string().required(),
})

export const reactOnPostValidator = joi.object({
  postId: joi.string().required(),
  reactionType: joi.string().valid('Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry').required(),
  // reactionOn: joi.string().valid('Post').required(),
})

export const reactOnCommentValidator = joi.object({
  commentId: joi.string().required(),
  reactionType: joi.string().valid('Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry').required(),
  // reactionOn: joi.string().valid('Comment').required(),
})

export const commentPostValidator = joi.object({
  postId: joi.string().required(),
  postComment: joi.string().required(),
})

export const replayPostValidator = joi.object({
  postId: joi.string().required(),
  commentId: joi.string().required(),
  replayTo: joi.string().required(),
  message: joi.string().required(),
})

export const deleteCommentValidator = joi.object({
  commentId: joi.string().required(),
})

export const paginationValidator = joi.object({
  page: joi.number().min(1).required(),
  limit: joi.number().required(),
})

export const sharePostValidator = joi.object({
  postId: joi.string().required(),
  postCaption: joi.string(),
})

export const getReactsOnLikesValidator = joi.object({
  postId: joi.string().required(),
})

export const getReactsOnCommentsValidator = joi.object({
  commentId: joi.string().required(),
})

export const getAllCommentsValidator = joi.object({
  postId: joi.string().required(),
})

export const deletePostValidator = joi.object({
  postId: joi.string().required(),
})
export const searchPostValidator = joi.object({
  prompt: joi.string(),
})

export const getUserPostValidator = joi.object({
  userId: joi.string().required(),
})

export const reportAnyValidator = joi.object({
  reportedToId: joi.string().required(),
  reportedType: joi.string().required(),
  tag: joi.string().required(),
  reason: joi.string().required(),
})
