import { Router } from 'express'

import {
  getPublicSignatureRequest,
  signPublicSignatureRequest,
} from '../controllers/publicSignature.controller.js'

const router = Router()

router.get('/:token', getPublicSignatureRequest)
router.post('/:token/sign', signPublicSignatureRequest)

export default router
