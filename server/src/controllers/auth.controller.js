import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { sanitizeUser } from '../utils/sanitizeUser.js'

export const register = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' })
  }

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    return res.status(409).json({ message: 'User already exists with this email' })
  }

  const user = await User.create({ name, email, password })
  const token = generateToken(user._id)

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: sanitizeUser(user),
  })
}

export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const token = generateToken(user._id)

  res.status(200).json({
    message: 'Login successful',
    token,
    user: sanitizeUser(user),
  })
}

export const getMe = (req, res) => {
  res.status(200).json({
    user: sanitizeUser(req.user),
  })
}
