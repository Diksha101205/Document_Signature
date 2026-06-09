import { Router } from 'express'

import {
  listSignatures,
  saveSignaturePosition,
} from '../controllers/signature.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/:fileId/signatures', authenticate, listSignatures)
router.post('/:fileId/signatures', authenticate, saveSignaturePosition)

export default router
