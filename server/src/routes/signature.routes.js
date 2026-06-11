import { Router } from 'express'

import {
  listSignatures,
  saveSignaturePosition,
} from '../controllers/signature.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/', authenticate, saveSignaturePosition)
router.get('/:fileId', authenticate, listSignatures)

export default router
