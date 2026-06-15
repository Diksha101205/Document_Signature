import AuditLog from '../models/AuditLog.js'

export const createAuditLog = async ({
  document,
  actorEmail,
  action,
  req,
  metadata = {},
}) =>
  AuditLog.create({
    document,
    actorEmail,
    action,
    ipAddress: req.requestContext?.ipAddress,
    userAgent: req.requestContext?.userAgent,
    metadata,
  })
