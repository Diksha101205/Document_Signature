import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'

import authRoutes from './routes/auth.routes.js'
import documentRoutes from './routes/document.routes.js'
import healthRoutes from './routes/health.routes.js'
import signatureRoutes from './routes/signature.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use('/uploads', express.static('uploads'))

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/docs', documentRoutes)
app.use('/api/docs', signatureRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use(errorHandler)

export default app
