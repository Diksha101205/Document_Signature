export const attachRequestContext = (req, res, next) => {
  const forwardedFor = req.headers['x-forwarded-for']
  const ipAddress = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress

  req.requestContext = {
    ipAddress,
    userAgent: req.headers['user-agent'] || '',
  }

  next()
}
