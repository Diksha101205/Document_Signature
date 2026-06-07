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
