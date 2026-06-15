import mongoose from 'mongoose'

import AuditLog from '../models/AuditLog.js'
import Document from '../models/Document.js'

export const getDocumentAuditTrail = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
    return res.status(400).json({ message: 'Invalid document id' })
  }

  const document = await Document.findOne({
    _id: req.params.fileId,
    owner: req.user._id,
  })

  if (!document) {
    return res.status(404).json({ message: 'Document not found' })
  }

  const auditTrail = await AuditLog.find({ document: document._id }).sort({
    createdAt: 1,
  })

  res.status(200).json({
    count: auditTrail.length,
    auditTrail,
  })
}
