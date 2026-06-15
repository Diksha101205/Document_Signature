import { Router } from 'express'

import { getDocumentAuditTrail } from '../controllers/audit.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/:fileId', authenticate, getDocumentAuditTrail)

export default router
