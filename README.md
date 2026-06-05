# Document Signature App

A MERN stack digital signature platform scaffold for the Labmentrix Web
Development internship project.

## Day 1 Completed

- Created MERN folder structure with `client` and `server`
- Initialized React app using Vite
- Added Tailwind CSS setup
- Added Node.js, Express, and MongoDB/Mongoose server structure
- Installed core backend libraries for uploads, PDF processing, auth, and security

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
