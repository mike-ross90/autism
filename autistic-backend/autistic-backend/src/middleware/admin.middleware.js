import jwt from 'jsonwebtoken'

const secretKey = 'adminSecret'

export const adminMiddleware = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, secretKey)

    if (decoded.exp <= Date.now() / 1000) {
      return res.status(401).json({ message: 'Token has expired' })
    }

    if (decoded.userType === 'admin') {
      next()
    } else {
      res.status(401).json({ message: 'Unauthorized' })
    }
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
