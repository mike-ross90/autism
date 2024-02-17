import pkg from 'joi'
import CustomError from './customError.util.js'
import CustomSuccess from './customSuccess.util.js'
const { ValidationError } = pkg

export const ResHandler = (err, req, res, next) => {
  let StatusCode = 500
  let data = {
    message: err.message,
    status: false,
  }
  if (err instanceof ValidationError) {
    StatusCode = 400
    data = {
      message: err.message,
      status: false,
    }
  }
  if (err instanceof CustomError) {
    StatusCode = err.status
    data = {
      message: err.message,
      status: false,
    }
  }

  // err instanceof CustomSuccess
  if (err instanceof CustomSuccess) {
    StatusCode = err.status
    data = {
      message: err.message,
      data: err.data,
      status: true,
    }
  }

  return res.status(StatusCode).json(data)
}
