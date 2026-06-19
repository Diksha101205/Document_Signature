import mongoose from 'mongoose'
import crypto from 'crypto'

import Document from '../models/Document.js'
import Signature from '../models/Signature.js'
import { createAuditLog } from '../services/audit.service.js'
import { sendMockSignatureEmail } from '../services/mockEmail.service.js'

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

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

  await Document.findByIdAndUpdate(fileId, { status: 'pending' })

  res.status(201).json({
    message: 'Signature position saved successfully',
    signature,
  })
}

export const sendSignatureLink = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid signature id' })
  }

  const signature = await Signature.findById(req.params.id)

  if (!signature) {
    return res.status(404).json({ message: 'Signature not found' })
  }

  const document = await ensureOwnedDocument(signature.fileId, req.user._id)
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const publicAppUrl = process.env.PUBLIC_APP_URL || process.env.CLIENT_URL
  const signingUrl = `${publicAppUrl}/sign/${token}`

  signature.signingTokenHash = tokenHash
  signature.signingTokenExpiresAt = expiresAt
  signature.signingLinkSentAt = new Date()
  await signature.save()

  const email = await sendMockSignatureEmail({
    to: signature.signer.email,
    signerName: signature.signer.name,
    documentTitle: document.title,
    signingUrl,
  })

  await createAuditLog({
    document: document._id,
    actorEmail: req.user.email,
    action: 'sent',
    req,
    metadata: {
      signatureId: signature._id,
      signerEmail: signature.signer.email,
      expiresAt,
    },
  })

  res.status(200).json({
    message: 'Signature link generated and mock email queued',
    signingUrl,
    expiresAt,
    email,
  })
}
