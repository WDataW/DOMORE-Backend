# DOMORE Backend

The API server for [DOMORE](https://github.com/WDataW/DOMORE) — a task management app. Built with Node.js and Express, backed by MongoDB, handling authentication, tasks, file uploads, and email.

- ⚙️ **This repo (API):** [github.com/WDataW/DOMORE-Backend](https://github.com/WDataW/DOMORE-Backend)
- 🖥️ **Frontend:** [github.com/WDataW/DOMORE](https://github.com/WDataW/DOMORE)
- 🔌 **Live API:** [api.domores.nerdos.site](https://api.domores.nerdos.site)
- 🌐 **Live app:** [domores.nerdos.site](https://domores.nerdos.site)

## Features

- **Authentication** — sign up, sign in, email verification, and password reset, using JWT sessions and bcrypt-hashed passwords.
- **Task data** — CRUD endpoints backing the frontend's task, tag, and calendar features.
- **File uploads** — image uploads (e.g. avatars) processed and validated with `sharp` and `file-type`.
- **Email** — transactional email (verification, password reset) sent via Resend in production; Nodemailer/SMTP is used for local testing only.
- **Validation** — request validation with Zod.
- **Security** — Helmet, CORS, cookie-based auth, and rate limiting on sensitive routes.
- **Localized system messages** — plain JSON locale files (`messages/locales`) used to generate localized copy for system inbox messages (not a general i18n framework for the whole API).

## Tech Stack

- **Runtime:** Node.js, Express 5
- **Database:** MongoDB via Mongoose
- **Auth:** jsonwebtoken, bcrypt, cookie-parser
- **Validation:** Zod
- **File handling:** express-fileupload, sharp, file-type
- **Email:** Nodemailer, Resend
- **Storage/Infra:** Supabase
- **Security:** Helmet, CORS, express-rate-limit
- **Dev tooling:** nodemon, module-alias

## Project Structure

```
.
├── config/               # Constants file (e.g. app name)
├── controllers/          # Route handler logic
├── db/                   # Database connection setup
├── errors/               # Custom error classes/handlers
├── messages/locales/     # JSON locale files for system inbox messages
├── middleware/           # Auth, error handling, rate limiting, etc.
├── models/               # Mongoose schemas/models
├── routes/               # Express route definitions
├── utils/                # Helper functions
├── validators/           # Zod request validation schemas
└── app.js                # App entry point
```

## Environment Variables

Create a `.env` file in the project root with the following:

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (optional — defaults to `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT access tokens |
| `COOKIES_SECRET` | Secret used to sign/verify cookies |
| `APP_URL` | Public URL of this API (used in emails/links) |
| `FRONT_END_URL` | URL of the frontend app (used for CORS and email links) |
| `SMTP_HOST` | SMTP server host — used for local/testing email only |
| `SMTP_USER` | SMTP username — used for local/testing email only |
| `SMTP_PASS` | SMTP password — used for local/testing email only |
| `EMAIL_SOURCE` | "From" address used on outgoing email (shared by both providers) |
| `RESEND_SECRET_KEY` | API key for Resend — the only credential Resend needs; used for production email |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase API key |

> For production email via Resend, you only need to set `RESEND_SECRET_KEY` (and `EMAIL_SOURCE` for the from-address) — the `SMTP_*` variables are only required if you're testing email locally through SMTP instead.

> Never commit your `.env` file. Keep secrets out of version control.

## Getting Started

### Requirements

- Node.js v18 or higher
- npm
- A MongoDB instance (local or hosted, e.g. MongoDB Atlas)
- A Supabase project and an SMTP or Resend account for email

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/WDataW/DOMORE-Backend.git
   cd DOMORE-Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root and fill in the variables listed [above](#environment-variables).
4. Start the server:
   ```bash
   npm run start
   ```
   This runs `nodemon app.js`, so the server restarts automatically on file changes.

By default the server runs on port `5000`, or the port set in the `PORT` environment variable (see `app.js`).

## Running With the Frontend

To use this API with the [DOMORE frontend](https://github.com/WDataW/DOMORE):

1. Get this backend running locally (or deployed) first.
2. Set `FRONT_END_URL` here to match wherever the frontend runs (e.g. `http://localhost:5173`) so CORS allows it.
3. In the frontend, point its API base URL at this server's address.

## Deployment

This API is deployed independently of the frontend (currently at [api.domores.nerdos.site](https://api.domores.nerdos.site)). To deploy your own instance:

1. Provision a MongoDB database, a Supabase project, and a Resend account (for production email).
2. Deploy this repo to a Node-friendly host (Render, Railway, a VPS, etc.).
3. Set all environment variables listed above on the host.
4. Update `FRONT_END_URL` to point at your deployed frontend, and update the frontend's API URL to point back at this deployment.

## About

- API: [api.domores.nerdos.site](https://api.domores.nerdos.site)
- Frontend: [domores.nerdos.site](https://domores.nerdos.site)
