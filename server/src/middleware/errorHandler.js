export const errorHandler = (error, req, res, next) => {
  console.error(error)

  if (error.name === 'MulterError') {
    return res.status(400).json({ message: error.message })
  }

  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: error.message })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message })
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'Duplicate field value already exists' })
  }

  res.status(error.statusCode || 500).json({
    message: error.message || 'Internal server error',
  })
}
