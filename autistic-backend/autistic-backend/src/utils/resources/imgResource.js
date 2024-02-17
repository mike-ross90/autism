import MediaModel from '../../models/media.model.js'

// console.log(process.env.MEDIA_PATH || 'haider', ' process.env.MEDIA_PATH')
export const uploadMedia = async (file, mediaType, userId, userType) => {
  if (file) {
    // console.log(file, 'safasf')
    const mediaTypes = ['image', 'video', 'audio']
    if (!mediaTypes.includes(mediaType)) {
      throw new Error('mediaType is not correct')
    }
    let path = file.path ? file.path : file
    path = path.replace(/\\/g, '/')
    console.log(path, 'dsssssssssssssssssssssssssssss')
    try {
      const createdMedia = await new MediaModel({
        mediaUrl:
          'https://autisticspectrum-api.thesuitchstaging.com/autistic-spectrum-backend/autistic-backend/' +
          path,
        // mediaUrl:
        //   process.env.MEDIA_PATH ||
        //   'https://autisticspectrum-api.thesuitchstaging.com/autistic-spectrum-backend/autistic-backend/' +
        //     path,
        mediaType,
        userId,
        userType,
      }).save()
      console.log('Successfully created media: ', createdMedia)
      return createdMedia._id
    } catch (error) {
      throw new Error(error.message, { cause: error })
    }
  }
  return false
}
