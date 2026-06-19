# Document Signature App

A MERN stack digital signature platform scaffold for the Labmentrix Web
Development internship project.

## Day 1 Completed

- Created MERN folder structure with `client` and `server`
- Initialized React app using Vite
- Added Tailwind CSS setup
- Added Node.js, Express, and MongoDB/Mongoose server structure
- Installed core backend libraries for uploads, PDF processing, auth, and security

## Day 2 Completed

- Added user registration and login API routes
- Added JWT token generation with configurable expiry
- Added bcrypt password hashing through the User model
- Added protected route middleware that validates tokens and loads the user
- Added `/api/auth/me` as a protected route example

## Day 3 Completed

- Added protected PDF upload API route
- Configured Multer to accept PDF files only
- Stored uploaded file path and metadata in MongoDB
- Added upload error handling for invalid file types and Multer limits

## Day 4 Completed

- Added API to fetch the authenticated user's uploaded files
- Added API to fetch one owned document by id
- Served uploaded PDFs from the Express server for preview
- Added React dashboard to display uploaded documents
- Added PDF preview support with `react-pdf`

## Day 5 Completed

- Added Signature model with file relation, coordinates, signer, and status
- Added API to save signature positions on a document
- Added API to list signature placeholders for a document
- Added position-based signature placeholder rendering on the PDF dashboard

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Security and workflow libraries: JWT, bcrypt, Multer, PDF-Lib

## Run Locally

### Client

```bash
cd client
npm run dev
```

### Server

```bash
cd server
copy .env.example .env
npm run dev
```

Update `server/.env` with your MongoDB URI and JWT secret before running the
backend.

## Auth API

### Register

```http
POST /api/auth/register
```

```json
{
  "name": "Diksha",
  "email": "diksha@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "diksha@example.com",
  "password": "password123"
}
```

### Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

## Document Upload API

```http
POST /api/docs/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Form fields:

- `document`: PDF file
- `title`: optional document title

## Document List API

```http
GET /api/docs
Authorization: Bearer <token>
```

## Single Document API

```http
GET /api/docs/:id
Authorization: Bearer <token>
```

## Signature APIs

```http
POST /api/docs/:fileId/signatures
Authorization: Bearer <token>
```

```json
{
  "signer": {
    "name": "Client Name",
    "email": "client@example.com"
  },
  "page": 1,
  "x": 120,
  "y": 240,
  "width": 180,
  "height": 56
}
```

```http
GET /api/docs/:fileId/signatures
Authorization: Bearer <token>
```

## Day 6 Completed

- Added top-level signature save route
- Added drag-and-drop signature field placement in the PDF editor
- Saved coordinates relative to the rendered PDF page
- Kept document-scoped signature routes for compatibility

## Day 7 Completed

- Debugged frontend and backend integration points
- Added safer validation for invalid document ids
- Normalized signature coordinate values before saving
- Added Postman collection and local environment for API testing

```http
POST /api/signatures
Authorization: Bearer <token>
```

```json
{
  "fileId": "<document-id>",
  "signer": {
    "name": "Client Name",
    "email": "client@example.com"
  },
  "page": 1,
  "x": 120,
  "y": 240,
  "width": 180,
  "height": 56
}
```

## Postman Tests

Postman files are available in the `postman` folder:

- `postman/Document-Signature-App.postman_collection.json`
- `postman/Document-Signature-App.postman_environment.json`

Import both files into Postman, select the local environment, start the backend,
and choose a local PDF file in the upload request before running the collection.

## Day 8 Completed

- Added signed PDF generation with PDF-Lib
- Embedded saved signature positions into the PDF
- Exported signed PDFs to `server/uploads/signed`
- Updated document status and signed file URL after generation

```http
POST /api/docs/:id/generate-signed-pdf
Authorization: Bearer <token>
```

## Day 9 Completed

- Added tokenized public signature links
- Stored hashed signing tokens with expiry
- Added mock email sender that logs signing emails to `server/logs`
- Added protected route to send a signer link
- Added public route to fetch signature request details by token

```http
POST /api/signatures/:id/send-link
Authorization: Bearer <token>
```

```http
GET /api/public/signatures/:token
```

## Day 10 Completed

- Added request-context middleware for IP and user-agent capture
- Added audit log service for consistent audit records
- Logged document upload, signer-link sent, public link viewed, and signing events
- Added public signing completion route
- Added protected audit trail route

```http
POST /api/public/signatures/:token/sign
```

```http
GET /api/audit/:fileId
Authorization: Bearer <token>
```

## Day 11 Completed

- Added signer response status flow: `pending`, `signed`, `rejected`
- Added public accept/reject route with conditional validation
- Stored rejection reason, rejection time, and rejection IP
- Updated document status based on signature outcomes
- Logged signed and rejected responses in the audit trail

```http
POST /api/public/signatures/:token/respond
```

```json
{
  "status": "rejected",
  "reason": "Incorrect document details"
}
```
