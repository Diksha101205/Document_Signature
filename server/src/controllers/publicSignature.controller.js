import crypto from 'crypto'

import Signature from '../models/Signature.js'
import { createAuditLog } from '../services/audit.service.js'

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

const normalizePath = (filePath) => filePath.replace(/\\/g, '/')

const findSignatureByToken = (token) =>
  Signature.findOne({
    signingTokenHash: hashToken(token),
    signingTokenExpiresAt: { $gt: new Date() },
  }).populate('fileId')

const updateDocumentStatusFromSignatures = async (document) => {
  const signatures = await Signature.find({ fileId: document._id })

  if (signatures.some((signature) => signature.status === 'rejected')) {
    document.status = 'rejected'
  } else if (
    signatures.length > 0 &&
    signatures.every((signature) => signature.status === 'signed')
  ) {
    document.status = 'signed'
  } else {
    document.status = 'pending'
  }

  await document.save()
}

export const getPublicSignatureRequest = async (req, res) => {
  const signature = await findSignatureByToken(req.params.token)

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

export const respondToPublicSignatureRequest = async (req, res) => {
  const { status, reason = '' } = req.body
  const nextStatus = status || 'signed'
  const signature = await findSignatureByToken(req.params.token)

  if (!signature || !signature.fileId) {
    return res.status(404).json({ message: 'Signature link is invalid or expired' })
  }

  if (!['signed', 'rejected'].includes(nextStatus)) {
    return res.status(400).json({ message: 'Status must be signed or rejected' })
  }

  if (nextStatus === 'rejected' && !reason.trim()) {
    return res.status(400).json({ message: 'Rejection reason is required' })
  }

  if (['signed', 'rejected'].includes(signature.status)) {
    return res.status(409).json({
      message: `Signature is already ${signature.status}`,
    })
  }

  if (nextStatus === 'signed') {
    signature.status = 'signed'
    signature.signedAt = new Date()
    signature.signedIpAddress = req.requestContext?.ipAddress
  } else {
    signature.status = 'rejected'
    signature.rejectedAt = new Date()
    signature.rejectedIpAddress = req.requestContext?.ipAddress
    signature.rejectionReason = reason.trim()
  }

  await signature.save()
  await updateDocumentStatusFromSignatures(signature.fileId)

  await createAuditLog({
    document: signature.fileId._id,
    actorEmail: signature.signer.email,
    action: nextStatus,
    req,
    metadata: {
      signatureId: signature._id,
      signedAt: signature.signedAt,
      rejectedAt: signature.rejectedAt,
      rejectionReason: signature.rejectionReason,
      access: 'public-token',
    },
  })

  res.status(200).json({
    message:
      nextStatus === 'signed'
        ? 'Signature completed successfully'
        : 'Signature rejected successfully',
    signature: {
      id: signature._id,
      signer: signature.signer,
      status: signature.status,
      signedAt: signature.signedAt,
      signedIpAddress: signature.signedIpAddress,
      rejectedAt: signature.rejectedAt,
      rejectedIpAddress: signature.rejectedIpAddress,
      rejectionReason: signature.rejectionReason,
    },
  })
}

export const signPublicSignatureRequest = async (req, res) => {
  req.body = { ...(req.body || {}), status: 'signed' }
  return respondToPublicSignatureRequest(req, res)
}

export const rejectPublicSignatureRequest = async (req, res) => {
  req.body = { ...(req.body || {}), status: 'rejected' }
  return respondToPublicSignatureRequest(req, res)
}
