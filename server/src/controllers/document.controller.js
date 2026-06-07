import path from 'path'

import Document from '../models/Document.js'

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'PDF document file is required' })
  }

  const fallbackTitle = path.parse(req.file.originalname).name
  const title = req.body.title?.trim() || fallbackTitle

  const document = await Document.create({
    owner: req.user._id,
    title,
    originalFileUrl: req.file.path,
    originalFileName: req.file.originalname,
    storedFileName: req.file.filename,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    status: 'draft',
  })

  res.status(201).json({
    message: 'Document uploaded successfully',
    document,
  })
}
