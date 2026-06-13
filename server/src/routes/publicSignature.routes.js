import { Router } from 'express'

import { getPublicSignatureRequest } from '../controllers/publicSignature.controller.js'

const router = Router()

router.get('/:token', getPublicSignatureRequest)

export default router
