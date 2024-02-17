import axios from 'axios'
import { promises as fsPromises } from 'fs'
import { uid } from 'uid/secure'

export const saveNetworkImage = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    console.log(response.data, 'saveNetworkImage')
    if (response.status === 200) {
      const contentType = response.headers['content-type']
      const extension = contentType.split('/').pop()
      const profilePic = Buffer.from(response.data)

      const image = `./public/uploads/${uid(16)}.${extension}`
      await fsPromises.writeFile(image, profilePic)

      return {
        hasError: false,
        image,
      }
    } else {
      console.log('Failed network image:', response)
      return {
        hasError: true,
        message: 'Error while fetching image',
      }
    }
  } catch (error) {
    console.log('Error while fetching image:', error)
    return {
      hasError: true,
      message: 'Error while fetching image',
    }
  }
}
