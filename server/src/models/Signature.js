import mongoose from 'mongoose'

const signatureSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    signer: {
      name: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
    },
    coordinates: {
      page: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
      },
      x: {
        type: Number,
        required: true,
        min: 0,
      },
      y: {
        type: Number,
        required: true,
        min: 0,
      },
      width: {
        type: Number,
        required: true,
        default: 180,
        min: 1,
      },
      height: {
        type: Number,
        required: true,
        default: 56,
        min: 1,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'signed', 'rejected'],
      default: 'pending',
    },
    signedAt: Date,
    signedIpAddress: String,
    rejectedAt: Date,
    rejectedIpAddress: String,
    rejectionReason: {
      type: String,
      trim: true,
    },
    signingTokenHash: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    signingTokenExpiresAt: Date,
    signingLinkSentAt: Date,
  },
  { timestamps: true }
)

const Signature = mongoose.model('Signature', signatureSchema)

export default Signature
