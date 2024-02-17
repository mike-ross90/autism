import NotesModel from '../models/notes.model.js'
// import AuthModel from '../models/auth.model.js'
import { notesValidator } from '../utils/validator/noteValidator.js'
import { checkMongooseId } from '../services/mongooseResource.js'
import CustomSuccess from '../utils/responseHandlers/customSuccess.util.js'
import CustomError from '../utils/responseHandlers/customError.util.js'

// @Desc:  Get all notes
// @Route: GET /api/notes/get_all_notes
// @Access: Private
export const getAllNotes = async (req, res, next) => {
  try {
    const { userId, userType } = req

    if (userType === 'parent') {
      return next(CustomError.forbidden('Only experts can creates notes'))
    }

    const notes = await NotesModel.find({ userId })

    if (!notes || notes.length === 0) {
      return next(CustomSuccess.createSuccess([], 'No notes found', 200))
    }

    const payload = notes.map(({ title, description }) => ({
      title,
      description,
    }))

    return next(CustomSuccess.createSuccess(payload, 'Notes fetched successfully', 200))
  } catch (error) {
    return next(CustomError.internal(error.message))
  }
}

// @Desc:  Create notes
// @Route: POST /api/notes/create_notes
// @Access: Private
export const createNotes = async (req, res, next) => {
  try {
    const { error } = await notesValidator.validateAsync(req.body)
    if (error) {
      return next(new CustomError(400, error.details[0].message))
    }

    const { userType } = req
    if (userType === 'parent') {
      return next(CustomError.forbidden('Only experts can create notes'))
    }

    const { title, description } = req.body
    const { userId } = req
    if (!userId) {
      return next(CustomError.notFound('User not found'))
    }

    const createNote = await new NotesModel({
      userId,
      title,
      description,
    }).save()

    return next(CustomSuccess.createSuccess(createNote, 'Note created successfully', 201))
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError('Duplicate keys not allowed', 409))
    }
    return next(CustomError.internal(error.message))
  }
}

// @Desc:  Get Note By NoteId
// @Route: GET /api/notes/get_notes
// @Access: Private
export const getNoteByNoteId = async (req, res, next) => {
  try {
    const { userId } = req
    const { noteId } = req.query

    if (!checkMongooseId(noteId)) {
      return next(CustomError.badRequest('Invalid Note Id'))
    }

    const note = await NotesModel.findOne({ _id: noteId, userId })

    if (!note) {
      return next(CustomError.notFound('Note not found'))
    }

    const payload = {
      title: note.title,
      description: note.description,
    }

    return next(CustomSuccess.createSuccess(payload, 'Note fetched successfully', 200))
  } catch (error) {
    return next(CustomError.internal(error.message))
  }
}

// @Desc:  Delete Note By NoteId
// @Route: DELETE /api/notes/delete_note
// @Access: Private
export const deleteNoteByNoteId = async (req, res, next) => {
  try {
    const { userId } = req
    const { noteId } = req.query

    if (!checkMongooseId(noteId)) {
      return next(CustomError.badRequest('Invalid Note Id'))
    }

    const deletedNote = await NotesModel.deleteOne({ _id: noteId, userId })

    if (deletedNote.deletedCount === 0) {
      return next(CustomError.notFound('No note found for this ID'))
    }

    return next(CustomSuccess.createSuccess([], 'Note deleted successfully', 201))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc:  Delete All Notes
// @Route: DELETE /api/notes/delete_all_notes
// @Access: Private
export const deleteAllNotes = async (req, res, next) => {
  try {
    const { userId, userType } = req

    if (!checkMongooseId(userId)) {
      return next(CustomError.badRequest('Invalid UserId'))
    }

    if (userType === 'parent') {
      return next(CustomError.forbidden('Only experts can delete notes'))
    }

    const notes = await NotesModel.deleteMany({ userId })

    if (notes.deletedCount === 0) {
      return next(CustomError.notFound('No notes found for this user'))
    }

    return next(CustomSuccess.createSuccess([], 'All notes deleted successfully', 200))
  } catch (error) {
    return next(CustomError.internal('Internal server error'))
  }
}

// @Desc:  Update Note By Id
// @Route: PUT /api/notes/update_note
// @Access: Private
export const updateNoteById = async (req, res, next) => {
  try {
    const { userId } = req
    const { noteId } = req.query

    if (!checkMongooseId(noteId)) {
      return next(CustomError.badRequest('Invalid Note Id'))
    }

    const note = await NotesModel.findOne({ _id: noteId, userId })

    if (!note) {
      return next(CustomError.notFound('Note not found'))
    }

    const { title, description } = req.body

    note.title = title || note.title
    note.description = description || note.description

    await note.save()

    return next(CustomSuccess.createSuccess(note, 'Note updated successfully', 200))
  } catch (error) {
    return next(CustomError.internal(error.message))
  }
}
