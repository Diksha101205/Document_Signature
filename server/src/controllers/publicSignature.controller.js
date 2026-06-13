import crypto from 'crypto'

import Signature from '../models/Signature.js'

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
