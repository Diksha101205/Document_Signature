import crypto from 'crypto'

import Signature from '../models/Signature.js'
import { createAuditLog } from '../services/audit.service.js'

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

const normalizePath = (filePath) => filePath.replace(/\\/g, '/')

export const getPublicSignatureRequest = async (req, res) => {
  const tokenHash = hashToken(req.params.token)

  const signature = await Signature.findOne({
    signingTokenHash: tokenHash,
    signingTokenExpiresAt: { $gt: new Date() },
  }).populate('fileId')

  if (!signature || !signature.fileId) {
    return res.status(404).json({ message: 'Signature link is invalid or expired' })
  }

  const document = signature.fileId
  const filePath = normalizePath(document.filePath)

  await createAuditLog({
    document: document._id,
    actorEmail: signature.signer.email,
    action: 'viewed',
    req,
    metadata: {
      signatureId: signature._id,
      access: 'public-token',
    },
  })

  res.status(200).json({
    signature: {
      id: signature._id,
      signer: signature.signer,
      coordinates: signature.coordinates,
      status: signature.status,
      expiresAt: signature.signingTokenExpiresAt,
    },
    document: {
      id: document._id,
      title: document.title,
      originalFileName: document.originalFileName,
      previewUrl: `${req.protocol}://${req.get('host')}/${filePath}`,
    },
  })
}

export const signPublicSignatureRequest = async (req, res) => {
  const tokenHash = hashToken(req.params.token)

  const signature = await Signature.findOne({
    signingTokenHash: tokenHash,
    signingTokenExpiresAt: { $gt: new Date() },
  }).populate('fileId')

  if (!signature || !signature.fileId) {
    return res.status(404).json({ message: 'Signature link is invalid or expired' })
  }

  if (signature.status === 'signed') {
    return res.status(409).json({ message: 'Signature is already completed' })
  }

  signature.status = 'signed'
  signature.signedAt = new Date()
  signature.signedIpAddress = req.requestContext?.ipAddress
  await signature.save()

  await createAuditLog({
    document: signature.fileId._id,
    actorEmail: signature.signer.email,
    action: 'signed',
    req,
    metadata: {
      signatureId: signature._id,
      signedAt: signature.signedAt,
      access: 'public-token',
    },
  })

  res.status(200).json({
    message: 'Signature completed successfully',
    signature: {
      id: signature._id,
      signer: signature.signer,
      status: signature.status,
      signedAt: signature.signedAt,
      signedIpAddress: signature.signedIpAddress,
    },
  })
}
