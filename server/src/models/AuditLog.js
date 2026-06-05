import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    actorEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['uploaded', 'sent', 'viewed', 'signed', 'rejected', 'downloaded'],
    },
    ipAddress: String,
    userAgent: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
)

const AuditLog = mongoose.model('AuditLog', auditLogSchema)

export default AuditLog
