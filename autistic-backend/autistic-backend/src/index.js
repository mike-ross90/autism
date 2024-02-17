import express from 'express'
import connectDB from './db/db.js'
import { createServer } from 'http'
import helmet from 'helmet'
// eslint-disable-next-line no-unused-vars
import colors from 'colors'
import serverConfig from './config/server.config.js'
import socketWrapper from './utils/socketConnection.js'
import { InitiateRabbitMQ } from '../../autistic-chat/src/rabbitMQ.js'

import { config } from 'dotenv'
import cors from 'cors'

// routes
import authRoutes from './routes/auth.route.js'
import parentRoutes from './routes/parent.route.js'
import therapistRoutes from './routes/therapist.route.js'
import noteRoutes from './routes/note.route.js'
import postRoutes from './routes/posts.route.js'
import chatRoutes from './routes/chat.route.js'
import adminRoutes from './routes/admin.route.js'
import dietRoutes from './routes/diet.route.js'
import groupsRoutes from './routes/groups.route.js'

// import { errorHandler, notFound } from './middleware/error.middleware.js'
import { ResHandler } from './utils/responseHandlers/responseHandler.util.js'

export const app = express()

const API_PREFIX = '/api'
const AUTH_PREFIX = '/auth'
const PROFILE_PREFIX = '/profile'
const NOTES_PREFIX = '/notes'
const POSTS_PREFIX = '/posts'
const GROUPS_PREFIX = '/groups'
const CHAT_PREFIX = '/chat'
const DIET_PREFIX = '/diet'
const ADMIN_PREFIX = '/admin'

const corsOptions = {
  origin: '*',
}

const httpServer = createServer(app)

app.use(helmet())
app.use(cors(corsOptions))

config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('API is running...')
})

// routes
app.use(`${API_PREFIX}${AUTH_PREFIX}`, authRoutes, parentRoutes)
app.use(`${API_PREFIX}${PROFILE_PREFIX}`, therapistRoutes)
app.use(`${API_PREFIX}${NOTES_PREFIX}`, noteRoutes)
app.use(`${API_PREFIX}${POSTS_PREFIX}`, postRoutes)
app.use(`${API_PREFIX}${CHAT_PREFIX}`, chatRoutes)
app.use(`${API_PREFIX}${DIET_PREFIX}`, dietRoutes)
app.use(`${API_PREFIX}${ADMIN_PREFIX}`, adminRoutes)
app.use(`${API_PREFIX}${GROUPS_PREFIX}`, groupsRoutes)

// Error Middlewares
// app.use(notFound)
// app.use(errorHandler)
app.use(ResHandler)
const SERVER_PORT = serverConfig.SERVER_PORT

connectDB()
  .then(async (result) => {
    // Socket Function
    socketWrapper(httpServer, await InitiateRabbitMQ())
    // Socket Function
    httpServer.listen(serverConfig.SERVER_PORT, () => {
      console.log(`Server is running on http://localhost:${SERVER_PORT} successfully`.yellow.bold)
    })
  })
  .catch((err) => {
    console.error('Server Crash due to some reasons', err.message)
  })
