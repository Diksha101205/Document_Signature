# Postman Tests

Import these files into Postman:

- `Document-Signature-App.postman_collection.json`
- `Document-Signature-App.postman_environment.json`

Run order:

1. Health Check
2. Register User
3. Login User
4. Current User
5. Upload PDF Document
6. List Documents
7. Get Single Document
8. Save Signature Position
9. List Signatures
10. Send Signature Link
11. Public Signature Link Lookup
12. Generate Signed PDF

Before running the upload request, choose a local PDF file in the `document`
form-data field. The collection stores `authToken`, `documentId`, `previewUrl`,
`signedPreviewUrl`, `signatureId`, `signingUrl`, and `signingToken`
automatically for later requests.
