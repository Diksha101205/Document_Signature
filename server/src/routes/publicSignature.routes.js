import { Router } from 'express'

import {
  getPublicSignatureRequest,
  rejectPublicSignatureRequest,
  respondToPublicSignatureRequest,
  signPublicSignatureRequest,
} from '../controllers/publicSignature.controller.js'

const router = Router()

router.get('/:token', getPublicSignatureRequest)
router.post('/:token/respond', respondToPublicSignatureRequest)
router.post('/:token/sign', signPublicSignatureRequest)
router.post('/:token/reject', rejectPublicSignatureRequest)

export default router
