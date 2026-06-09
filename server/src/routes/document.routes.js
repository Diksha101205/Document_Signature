import { Router } from 'express'

import {
  getDocumentById,
  listDocuments,
  uploadDocument,
} from '../controllers/document.controller.js'
import { authenticate } from '../middleware/auth.js'
import { uploadPdf } from '../middleware/upload.js'

const router = Router()

router.get('/', authenticate, listDocuments)
router.post('/upload', authenticate, uploadPdf.single('document'), uploadDocument)
router.get('/:id', authenticate, getDocumentById)

export default router
