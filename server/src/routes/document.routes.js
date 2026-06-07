import { Router } from 'express'

import { uploadDocument } from '../controllers/document.controller.js'
import { authenticate } from '../middleware/auth.js'
import { uploadPdf } from '../middleware/upload.js'

const router = Router()

router.post('/upload', authenticate, uploadPdf.single('document'), uploadDocument)

export default router
