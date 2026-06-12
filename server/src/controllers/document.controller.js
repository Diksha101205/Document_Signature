import path from 'path'

import mongoose from 'mongoose'

import Document from '../models/Document.js'

const normalizePath = (filePath) => filePath.replace(/\\/g, '/')

const formatDocument = (document, req) => {
  const filePath = normalizePath(document.filePath)

  return {
    id: document._id,
    owner: document.owner,
    title: document.title,
    originalFileName: document.originalFileName,
    storedFileName: document.storedFileName,
    filePath,
    previewUrl: `${req.protocol}://${req.get('host')}/${filePath}`,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    status: document.status,
    signers: document.signers,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }
}

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
    document: formatDocument(document, req),
  })
}

export const listDocuments = async (req, res) => {
  const documents = await Document.find({ owner: req.user._id }).sort({
    createdAt: -1,
  })

  res.status(200).json({
    count: documents.length,
    documents: documents.map((document) => formatDocument(document, req)),
  })
}

export const getDocumentById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid document id' })
  }

  const document = await Document.findOne({
    _id: req.params.id,
    owner: req.user._id,
  })

  if (!document) {
    return res.status(404).json({ message: 'Document not found' })
  }

  res.status(200).json({
    document: formatDocument(document, req),
  })
}
