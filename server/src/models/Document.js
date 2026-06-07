import mongoose from 'mongoose'

const signerSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'signed', 'rejected'],
      default: 'pending',
    },
    signedAt: Date,
    ipAddress: String,
  },
  { _id: false }
)

const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalFileUrl: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    signedFileUrl: String,
    status: {
      type: String,
      enum: ['draft', 'pending', 'signed', 'rejected'],
      default: 'draft',
    },
    signers: [signerSchema],
  },
  { timestamps: true }
)

const Document = mongoose.model('Document', documentSchema)

export default Document
