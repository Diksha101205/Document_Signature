import jwt from 'jsonwebtoken'

import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing' })
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing in environment variables')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: 'User for this token no longer exists' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.message.includes('JWT_SECRET')) {
      return next(error)
    }

    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
