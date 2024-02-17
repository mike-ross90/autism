import { Server } from 'socket.io'
import { createRoom, getUserRoom } from '../controllers/chat.controller.js'
import { config } from 'dotenv'
// import { updateMessageStatus } from './updateMessageStatus.js'
// import ChatMessageModel from '../models/chatMessage.model.js'

config()

export default async (server, channel) => {
  try {
    const io = new Server(server, {
      cors: { origin: '*', methods: '*' },
    })

    io.on('connection', (socket) => {
      console.log('A client connected', socket.id)
      socket.on('createRoom', async (data) => {
        console.log('-------auhsdadajdm-', data)
        const { sender, receiver, pageNumber } = data
        console.log('data =>', data)
        const roomDetails = await createRoom(sender, receiver, pageNumber)
        socket.join(roomDetails.roomId)
        socket.emit('createRoom', roomDetails)
      })
      socket.on('sendContent', async (data) => {
        console.log('Received sendContent event:', data)

        channel.sendToQueue(process.env.RABBIT_QUEUE, Buffer.from(JSON.stringify(data)))

        if (data) {
          console.log('Emitting new_content event:', data)
          // if (data) {
          //   await updateMessageStatus(data.messageId, 'delivered')

          io.emit(data.roomId, {
            content: data.content,
            sender: data.sender,
            receiver: data.receiver,
            createdAt: data.createdAt,
          })
        }
      })

      socket.on('getChatThreads', async (data) => {
        console.log('data', data)
        const rooms = await getUserRoom(data)
        console.log('^^^^^', rooms)
        socket.emit('getChatThreads', rooms)
      })

      socket.on('disconnect', () => {
        console.log('A client disconnected', socket.id)
      })
    })
  } catch (error) {
    console.log(error.message)
    throw new Error(error.message)
  }
}
