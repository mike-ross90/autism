import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import {
  getAllNotes,
  createNotes,
  getNoteByNoteId,
  deleteNoteByNoteId,
  deleteAllNotes,
  updateNoteById,
} from '../controllers/notes.controller.js'
const router = express.Router()

router.route('/get_all_notes').get(authMiddleware, getAllNotes)
router.route('/create_notes').post(authMiddleware, createNotes)
router.route('/get_note').get(authMiddleware, getNoteByNoteId)
router.route('/delete_note').delete(authMiddleware, deleteNoteByNoteId)
router.route('/delete_all_notes').delete(authMiddleware, deleteAllNotes)
router.route('/update_note').put(authMiddleware, updateNoteById)

export default router
