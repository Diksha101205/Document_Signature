import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'

import healthRoutes from './routes/health.routes.js'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/api/health', healthRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

export default app
