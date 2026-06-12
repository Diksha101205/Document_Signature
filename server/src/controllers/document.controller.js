import fs from 'fs/promises'
import path from 'path'

import mongoose from 'mongoose'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

import Document from '../models/Document.js'
import Signature from '../models/Signature.js'

const normalizePath = (filePath) => filePath.replace(/\\/g, '/')

const formatDocument = (document, req) => {
  const filePath = normalizePath(document.filePath)
  const signedFilePath = document.signedFileUrl
    ? normalizePath(document.signedFileUrl)
    : ''

  return {
    id: document._id,
    owner: document.owner,
    title: document.title,
    originalFileName: document.originalFileName,
    storedFileName: document.storedFileName,
    filePath,
    previewUrl: `${req.protocol}://${req.get('host')}/${filePath}`,
    signedFileUrl: signedFilePath || null,
    signedPreviewUrl: signedFilePath
      ? `${req.protocol}://${req.get('host')}/${signedFilePath}`
      : null,
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

export const generateSignedPdf = async (req, res) => {
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

  const signatures = await Signature.find({ fileId: document._id }).sort({
    createdAt: 1,
  })

  if (signatures.length === 0) {
    return res.status(400).json({
      message: 'Add at least one signature position before generating a PDF',
    })
  }

  const originalPdfBytes = await fs.readFile(path.resolve(document.filePath))
  const pdfDoc = await PDFDocument.load(originalPdfBytes)
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  signatures.forEach((signature) => {
    const pageIndex = Math.max(0, signature.coordinates.page - 1)
    const page = pdfDoc.getPages()[pageIndex]

    if (!page) return

    const { width: pageWidth, height: pageHeight } = page.getSize()
    const scale = pageWidth / 620
    const x = signature.coordinates.x * scale
    const y =
      pageHeight -
      (signature.coordinates.y + signature.coordinates.height) * scale
    const boxWidth = signature.coordinates.width * scale
    const boxHeight = signature.coordinates.height * scale
    const signerLabel = signature.signer.name || signature.signer.email

    page.drawRectangle({
      x,
      y,
      width: boxWidth,
      height: boxHeight,
      borderColor: rgb(0.02, 0.45, 0.42),
      borderWidth: 1.5,
      color: rgb(0.9, 0.98, 0.96),
      opacity: 0.9,
    })

    page.drawText(`Signed by ${signerLabel}`, {
      x: x + 8,
      y: y + boxHeight / 2 + 2,
      size: 10,
      font,
      color: rgb(0.02, 0.28, 0.26),
      maxWidth: boxWidth - 16,
    })

    page.drawText(new Date().toISOString(), {
      x: x + 8,
      y: y + 8,
      size: 7,
      color: rgb(0.22, 0.38, 0.36),
      maxWidth: boxWidth - 16,
    })
  })

  const signedPdfBytes = await pdfDoc.save()
  const signedDirectory = path.resolve('uploads', 'signed')
  await fs.mkdir(signedDirectory, { recursive: true })

  const signedFileName = `signed-${document._id}-${Date.now()}.pdf`
  const signedFilePath = path.join('uploads', 'signed', signedFileName)
  await fs.writeFile(path.resolve(signedFilePath), signedPdfBytes)

  document.signedFileUrl = signedFilePath
  document.status = 'signed'
  await document.save()

  await Signature.updateMany(
    { fileId: document._id },
    { status: 'signed' }
  )

  res.status(200).json({
    message: 'Signed PDF generated successfully',
    document: formatDocument(document, req),
  })
}
