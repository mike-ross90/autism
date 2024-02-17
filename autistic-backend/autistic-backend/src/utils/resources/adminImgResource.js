import AdminMediaModel from '../../models/adminMedia.model.js'

export const adminUploadMedia = async (file, mediaType) => {
  if (file) {
    const mediaTypes = ['image', 'video', 'audio']
    if (!mediaTypes.includes(mediaType)) {
      throw new Error('mediaType is not correct')
    }
    let path = file.path ? file.path : file
    path = path.replace(/\\/g, '/')

    try {
      const createdMedia = await new AdminMediaModel({
        // mediaUrl:
        //   'https://autisticspectrum-api.thesuitchstaging.com/autistic-spectrum-backend/autistic-backend/' +
        //   path,
        mediaUrl: process.env.MEDIA_PATH + path,
        mediaType,
      }).save()
      console.log('Successfully created media: ', createdMedia)
      return createdMedia._id
    } catch (error) {
      throw new Error(error.message, { cause: error })
    }
  }
  return false
}
