import mongoose from 'mongoose'

import Document from '../models/Document.js'
import Signature from '../models/Signature.js'

const ensureOwnedDocument = async (documentId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    const error = new Error('Invalid document id')
    error.statusCode = 400
    throw error
  }

  const document = await Document.findOne({ _id: documentId, owner: userId })

  if (!document) {
    const error = new Error('Document not found')
    error.statusCode = 404
    throw error
  }

  return document
}

export const listSignatures = async (req, res) => {
  await ensureOwnedDocument(req.params.fileId, req.user._id)

  const signatures = await Signature.find({ fileId: req.params.fileId }).sort({
    createdAt: -1,
  })

  res.status(200).json({
    count: signatures.length,
    signatures,
  })
}

export const saveSignaturePosition = async (req, res) => {
  const fileId = req.params.fileId || req.body.fileId
  const { signer, x, y, page = 1, width = 180, height = 56 } = req.body
  const numericCoordinates = {
    page: Number(page),
    x: Number(x),
    y: Number(y),
    width: Number(width),
    height: Number(height),
  }

  if (!fileId || !signer?.email || x === undefined || y === undefined) {
    return res.status(400).json({
      message:
        'File id, signer email, x coordinate, and y coordinate are required',
    })
  }

  if (Object.values(numericCoordinates).some((value) => Number.isNaN(value))) {
    return res.status(400).json({
      message: 'Signature coordinates must be numbers',
    })
  }

  await ensureOwnedDocument(fileId, req.user._id)

  const signature = await Signature.create({
    fileId,
    signer: {
      name: signer.name || '',
      email: signer.email,
    },
    coordinates: numericCoordinates,
    status: 'pending',
  })

  res.status(201).json({
    message: 'Signature position saved successfully',
    signature,
  })
}
