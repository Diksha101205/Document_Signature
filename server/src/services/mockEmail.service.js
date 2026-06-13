import fs from 'fs/promises'
import path from 'path'

const mockEmailLogPath = path.resolve('logs', 'mock-emails.jsonl')

export const sendMockSignatureEmail = async ({ to, signerName, documentTitle, signingUrl }) => {
  const email = {
    to,
    subject: `Signature requested: ${documentTitle}`,
    body: `Hi ${signerName || 'there'}, please sign "${documentTitle}" here: ${signingUrl}`,
    signingUrl,
    createdAt: new Date().toISOString(),
  }

  await fs.mkdir(path.dirname(mockEmailLogPath), { recursive: true })
  await fs.appendFile(mockEmailLogPath, `${JSON.stringify(email)}\n`)

  console.log(`Mock signature email queued for ${to}: ${signingUrl}`)

  return email
}
