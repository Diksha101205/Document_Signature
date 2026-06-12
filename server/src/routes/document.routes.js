import { Router } from 'express'

import {
  generateSignedPdf,
  getDocumentById,
  listDocuments,
  uploadDocument,
} from '../controllers/document.controller.js'
import {
  listSignatures,
  saveSignaturePosition,
} from '../controllers/signature.controller.js'
import { authenticate } from '../middleware/auth.js'
import { uploadPdf } from '../middleware/upload.js'

const router = Router()

router.get('/', authenticate, listDocuments)
router.post('/upload', authenticate, uploadPdf.single('document'), uploadDocument)
router.post('/:id/generate-signed-pdf', authenticate, generateSignedPdf)
router.get('/:fileId/signatures', authenticate, listSignatures)
router.post('/:fileId/signatures', authenticate, saveSignaturePosition)
router.get('/:id', authenticate, getDocumentById)

export default router
