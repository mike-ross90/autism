import ChatMessageModel from '../models/chatMessage.model.js'
import ChatRoomModel from '../models/chatRoom.model.js'
// import CustomError from '../Utils/ResponseHandler/CustomError.js'
// import CustomSuccess from '../Utils/ResponseHandler/CustomSuccess.js'
import { Types, mongoose } from 'mongoose'

export const createRoom = async (sender, receiver, pageNumber = 1) => {
  try {
    const findConvo = await ChatRoomModel.findOne({
      $or: [
        {
          $and: [
            { sender: new Types.ObjectId(sender) },
            { receiver: new Types.ObjectId(receiver) },
          ],
        },
        {
          $and: [
            { sender: new Types.ObjectId(receiver) },
            { receiver: new Types.ObjectId(sender) },
          ],
        },
      ],
    })

    if (!findConvo) {
      const createRoom = await new ChatRoomModel({
        sender: sender,
        receiver: receiver,
      }).save()
      return { roomId: createRoom._id, messages: '', lastMessage: null }
    } else {
      console.log('hello', findConvo)
      const getMessages = await ChatMessageModel.find({
        roomId: findConvo._id,
      })
        .sort({ createdAt: 1 })
        .skip((Number(pageNumber) - 1) * 10)
        .limit(10)

      return { messages: getMessages, roomId: findConvo._id, lastMessage: findConvo.lastMessage }
    }
  } catch (error) {
    console.log(error)
    console.log('Error creating conversation')
  }
}

export const getUserRoom = async (payload) => {
  try {
    const { userId } = payload
    let findConvo = await ChatRoomModel.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
    if (findConvo.length === 0) {
      return {
        message: 'No matched conversations found',
      }
    }
    findConvo = Promise.all(
      findConvo.map(async (e) => {
        if (e.sender.toString() == userId) {
          console.log('hi')
          return await ChatRoomModel.populate(findConvo, [
            {
              path: 'receiver',
              select: 'fullName image',
              populate: {
                path: 'image',
                select: 'mediaUrl',
              },
            },
          ])
        }
        return await ChatRoomModel.populate(findConvo, [
          {
            path: 'sender',
            select: 'fullName image',
            populate: {
              path: 'image',
              select: 'mediaUrl',
            },
          },
        ])
      }),
    )

    return findConvo
  } catch (error) {
    console.log('Error creating conversation')
  }
}
