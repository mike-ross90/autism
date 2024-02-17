import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { createRoom } from '../controllers/chat.controller.js'
const router = express.Router()

router.route('/createRoom').post(authMiddleware, createRoom)

export default router
