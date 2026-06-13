import { Router } from 'express'

import {
  listSignatures,
  saveSignaturePosition,
  sendSignatureLink,
} from '../controllers/signature.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/', authenticate, saveSignaturePosition)
router.post('/:id/send-link', authenticate, sendSignatureLink)
router.get('/:fileId', authenticate, listSignatures)

export default router
