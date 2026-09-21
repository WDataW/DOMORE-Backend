# DOMORE API Documentation

The API server for **DOMORE**, a task management app. Built with Node.js, Express 5, and MongoDB (Mongoose).

- **Base URL (production):** `https://api.domore.nerdos.site/api/v1`
- **Base URL (local):** `http://localhost:5000/api/v1`
- **Content type:** `application/json` for all requests, unless noted (profile picture upload uses `multipart/form-data`)
- **Auth:** HTTP-only, signed cookies (`accessToken` / `refreshToken`) — not bearer tokens. All requests must be made with `credentials: 'include'` (fetch) or `withCredentials: true` (axios) so cookies are sent.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Rate Limiting](#rate-limiting)
4. [Auth Endpoints](#auth-endpoints)
5. [Task Endpoints](#task-endpoints)
6. [Tag Endpoints](#tag-endpoints)
7. [Account Endpoints](#account-endpoints)
   - [Profile Picture](#profile-picture)
   - [Inbox](#inbox)
   - [Settings](#settings)
   - [Account Management](#account-management)
8. [Data Models](#data-models)

---

## Authentication

DOMORE uses **cookie-based JWT authentication** with an access/refresh token pair:

| Cookie | Lifetime | Purpose |
|---|---|---|
| `accessToken` | 15 minutes | Sent on every request; validated on protected routes |
| `refreshToken` | 30 days | Used transparently to reissue an `accessToken` when it's missing/expired |

Both cookies are `httpOnly`, `signed`, `sameSite: strict`, and `secure` in production. There is no separate `/refresh` endpoint — the `authenticator` middleware checks for a valid `accessToken` first, and if absent/invalid, transparently validates the `refreshToken` (matched against a stored session by user, `User-Agent`, and session ID) and re-issues a new `accessToken` cookie on the same request.

Routes requiring authentication are marked **🔒 Auth required** below. All `/tasks`, `/tags`, and `/account` routes require authentication (applied at the router level); on `/auth`, only `/showMe` and `/logout` do.

If authentication fails, the API returns:
```json
{ "message": "Please log in first" }
```
with HTTP status `401`.

---

## Error Handling

All errors are returned as JSON in the form:
```json
{ "message": "Human-readable error description" }
```

| Status | Meaning |
|---|---|
| `400 Bad Request` | Malformed request, failed validation, or invalid business logic (e.g. wrong password) |
| `401 Unauthorized` | Missing/invalid/expired auth cookies |
| `404 Not Found` | Resource doesn't exist, or unknown route |
| `429 Too Many Requests` | Rate limit exceeded (message includes retry time in minutes) |
| `500 Internal Server Error` | Unexpected server error |

Request bodies/params are validated with **Zod**. Validation failures return `400` with a human-readable message describing the offending field(s).

---

## Rate Limiting

Rate limits are keyed by authenticated user ID when available, otherwise by IP. Limits are applied per route group, per 15-minute window:

| Group | Limit | Applies to |
|---|---|---|
| Auth (`authLimiter`) | 10 req / 15 min | All `/auth/*` routes |
| Tasks (`tasksLimiter`) | 150 req / 15 min | All `/tasks/*` routes |
| Tags (`tagsLimiter`) | 150 req / 15 min | All `/tags/*` routes |
| Account — loose (`looseLimiter`) | 150 req / 15 min | `/account/pfp` (GET), `/account/inbox`, `/account/settings`, `/account/name` |
| Account — strict (`strictLimiter`) | 10 req / 15 min | `/account/pfp` (POST/DELETE), `/account/delete-account` |

Exceeding a limit returns `429` with a message like `"Too many request, try again later in 15 minutes"`.

---

## Auth Endpoints

Base path: `/api/v1/auth`

### Register
`POST /auth/register`

Creates a new (unverified) account and sends a 6-digit verification code to the given email. Also provisions default settings, default tags, and a welcome inbox message for the new user.

**Body:**
```json
{
  "fullname": "string, 1–25 chars",
  "email": "valid email",
  "password": "string, max 24 chars, must be a strong password"
}
```

**Responses:**
- `201 Created` — `"Success"` (returned even if the email is already registered, to avoid leaking which emails exist)

---

### Login
`POST /auth/login`

**Body:**
```json
{
  "email": "valid email",
  "password": "string"
}
```

**Responses:**
- `200 OK` — `{ "message": "Logged in succesfully" }` — sets `accessToken` + `refreshToken` cookies
- `401 Unauthorized` — invalid email/password, or `"Please verify your Email address before logging in"` if `isVerified` is `false`

---

### Verify Email
`POST /auth/verify-email`

Confirms the 6-digit code sent to the user's email during registration. On success, logs the user in (sets auth cookies).

**Body:**
```json
{
  "email": "valid email",
  "code": "exactly 6 digits"
}
```

**Responses:**
- `200 OK` — `{ "message": "Email verified successfully" }` (or `"Email already verified"` if already verified)
- `400 Bad Request` — invalid/expired verification code

---

### Resend Verification Email
`POST /auth/resend-verification-email`

Issues a new 6-digit code, replacing any existing pending code for the email.

**Body:**
```json
{ "email": "valid email" }
```

**Responses:**
- `200 OK` — the new verification code is returned in the body (used for local/dev testing), or `"Email already verified"` if already verified

---

### Forgot Password
`POST /auth/forgot-password`

Sends a password-reset email containing a reset token. Always returns success, even if the email doesn't exist (to avoid leaking account existence).

**Body:**
```json
{ "email": "valid email" }
```

**Responses:**
- `200 OK` — `{ "message": "Reset email sent" }` or `"Check your email"`

---

### Reset Password
`POST /auth/reset-password`

**Body:**
```json
{
  "email": "valid email",
  "resetToken": "64-char hex string from the reset email",
  "newPassword": "string, max 24 chars, must be a strong password"
}
```

**Responses:**
- `200 OK` — `{ "message": "password resetted" }`
- `400 Bad Request` — token missing/expired/invalid, or no reset was requested

---

### Show Me 🔒
`GET /auth/showMe`

Returns the current authenticated user's profile. Also updates the user's login streak as a side effect.

**Responses:**
- `200 OK`:
```json
{
  "_id": "string",
  "email": "string",
  "fullname": "string",
  "lastLogIn": "ISO date",
  "highestLogInStreak": "number",
  "currentLogInStreak": "number",
  "createdAt": "ISO date"
}
```

---

### Logout 🔒
`POST /auth/logout`

Revokes the current session's refresh token and clears the `accessToken` cookie.

**Responses:**
- `200 OK` — `{ "message": "Logged out successfully" }`

---

## Task Endpoints

Base path: `/api/v1/tasks` — 🔒 all routes require authentication.

### Get All Tasks
`GET /tasks/`

Returns all of the current user's tasks, sorted with pinned tasks first, then the rest sorted by due date.

**Responses:**
- `200 OK` — array of [Task](#task) objects (without `userId`/`__v`)

---

### Get Single Task
`GET /tasks/:taskId`

`taskId` format: `task:<uuid>`

**Responses:**
- `200 OK` — a [Task](#task) object
- `404 Not Found` — `"Task not found"`

---

### Create Task
`PUT /tasks/create-task`

**Body:**
```json
{
  "dueDate": "ISO datetime, required",
  "title": "string, max 100 chars, required",
  "description": "string, max 500 chars",
  "priority": "'high' | 'medium' | 'low', required",
  "tags": ["tag:<uuid>", "..."]
}
```

**Responses:**
- `201 Created` — the created [Task](#task) object
- `400 Bad Request` — missing required fields

---

### Edit Task
`PATCH /tasks/:taskId`

Partial update — only send the fields you want to change. Same shape as create, plus:

**Body (all optional):**
```json
{
  "dueDate": "ISO datetime",
  "title": "string, max 100 chars",
  "description": "string, max 500 chars",
  "priority": "'high' | 'medium' | 'low'",
  "tags": ["tag:<uuid>"],
  "status": "'completed' | 'active'",
  "pinned": "boolean"
}
```

**Responses:**
- `200 OK` — the updated [Task](#task) object
- `400 Bad Request` — `"Task is inexistent"`

---

### Delete Task
`DELETE /tasks/:taskId`

**Responses:**
- `200 OK` — the deleted [Task](#task) object, or `{ "message": "Task already deleted" }` if it didn't exist

---

## Tag Endpoints

Base path: `/api/v1/tags` — 🔒 all routes require authentication.

Every new user is seeded with a fixed set of built-in tags (`All`, `active`, `today`, `tomorrow`, `overdue`, `High Priority`, `Medium Priority`, `Low Priority`, `completed`, `pinned`) at registration.

### Get All Tags
`GET /tags/`

**Responses:**
- `200 OK` — array of [Tag](#tag) objects (without `userId`)

---

### Get Single Tag
`GET /tags/:tagId`

`tagId` format: `tag:<uuid>`

**Responses:**
- `200 OK` — a [Tag](#tag) object

---

### Create Tag
`PUT /tags/create-tag`

**Body:**
```json
{
  "title": "string, 1–25 chars, required",
  "color": "hex color string, required",
  "home": "boolean",
  "pinned": "boolean, default false",
  "builtIn": "boolean"
}
```

**Responses:**
- `201 Created` — the created [Tag](#tag) object
- `400 Bad Request` — missing required fields

---

### Edit Tag
`PATCH /tags/:tagId`

**Body (all optional, same shape as create minus `builtIn`):**
```json
{
  "title": "string, 1–25 chars",
  "color": "hex color string",
  "home": "boolean",
  "pinned": "boolean"
}
```

**Responses:**
- `200 OK` — the updated [Tag](#tag) object
- `400 Bad Request` — `"Tag is inexistent"`

---

### Delete Tag
`DELETE /tags/:tagId`

**Responses:**
- `200 OK` — the deleted [Tag](#tag) object, or `{ "message": "Tag already deleted" }` if it didn't exist

---

## Account Endpoints

Base path: `/api/v1/account` — 🔒 all routes require authentication.

### Profile Picture

Profile pictures are stored in Supabase Storage (bucket `Avatars`), converted to WebP, and served via short-lived (1 hour) signed URLs.

#### Get Profile Picture
`GET /account/pfp`

**Responses:**
- `200 OK`:
```json
{ "signedUrl": "https://... (or '/images/defaultPFP.png' if none set)" }
```

#### Upload Profile Picture
`POST /account/pfp`

**Body:** `multipart/form-data` with a field named `image` (max 5 MB, must be a valid image — validated via `file-type`/`sharp`).

**Responses:**
- `200 OK`:
```json
{ "signedUrl": "https://..." }
```

#### Remove Profile Picture
`DELETE /account/pfp`

**Responses:**
- `200 OK` — `{ "message": "Image removed successfully" }`

---

### Inbox

#### Get Inbox
`GET /account/inbox`

Returns both user-facing messages and localized system messages (localized based on the user's `settings.language`, defaulting to `en`).

**Responses:**
- `200 OK` — array of [Message](#message) / [SystemMessage](#systemmessage) objects (system messages include resolved `title`/`content` from locale files)

#### Mark Message as Read
`PATCH /account/inbox/read/:messageId`

`messageId` format: `message:<uuid>`

**Body:**
```json
{ "from": "string, 1–25 chars (e.g. 'system' or the sender)" }
```

**Responses:**
- `200 OK` — the updated message object
- `404 Not Found` — `"Message is inexistent"`

---

### Settings

#### Get Settings
`GET /account/settings`

**Responses:**
- `200 OK` — a [Settings](#settings-1) object (without `userId`/`_id`/`__v`)

#### Edit Settings
`PATCH /account/settings`

Partial update — only send what you want to change.

**Body (all optional):**
```json
{
  "language": "'en' | 'ar'",
  "theme": {
    "base": "'light' | 'dark'",
    "lightAccentColor": "hex color",
    "lightSecondaryColor": "hex color",
    "darkAccentColor": "hex color",
    "darkSecondaryColor": "hex color"
  }
}
```

**Responses:**
- `200 OK` — the updated [Settings](#settings-1) object

---

### Account Management

#### Update Full Name
`PATCH /account/name`

**Body:**
```json
{ "name": "string, 1–25 chars" }
```

**Responses:**
- `200 OK` — the updated [User](#user) object

#### Delete Account
`POST /account/delete-account`

Deletes the account and cascades deletion of all associated data (tasks, settings, tags, refresh tokens, reset-password requests, verification requests) if the password is correct.

**Body:**
```json
{ "password": "string" }
```

**Responses:**
- `200 OK` — `"account deleted along with all its data"` (silently no-ops without cascading delete if the password is wrong, but still returns `200`)

---

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "fullname": "string, max 25 chars",
  "email": "string, unique",
  "password": "hashed, never returned by API",
  "isVerified": "boolean, default false",
  "isDeleted": "boolean, default false",
  "isSuspended": "boolean, default false",
  "highestLogInStreak": "number, default 1",
  "currentLogInStreak": "number, default 1",
  "lastLogIn": "Date",
  "createdAt": "Date, immutable"
}
```

### Task
```json
{
  "id": "string, format 'task:<uuid>', immutable",
  "userId": "string, immutable (stripped from list responses)",
  "dueDate": "Date, required",
  "title": "string, 1–100 chars, required",
  "description": "string, max 500 chars",
  "priority": "'high' | 'medium' | 'low', default 'medium'",
  "tags": ["string (tag ids)"],
  "status": "'completed' | 'active', default 'active'",
  "pinned": "boolean, default false",
  "completedAt": "Date",
  "createdAt": "Date, immutable"
}
```

### Tag
```json
{
  "id": "string, format 'tag:<uuid>', immutable",
  "userId": "string, immutable (stripped from responses)",
  "title": "string, required, unique",
  "color": "hex color string, required",
  "icon": "string, required, e.g. 'bg-[#5a9afa]'",
  "home": "boolean, default false",
  "pinned": "boolean, default false",
  "builtIn": "boolean, default false",
  "createdAt": "Date, immutable"
}
```

### Settings
```json
{
  "language": "'en' | 'ar'",
  "theme": {
    "base": "'light' | 'dark'",
    "lightAccentColor": "hex color",
    "lightSecondaryColor": "hex color",
    "darkAccentColor": "hex color",
    "darkSecondaryColor": "hex color"
  }
}
```

### Message
```json
{
  "id": "string, format 'message:<uuid>', immutable",
  "userId": "string, immutable",
  "from": "string, max 25 chars",
  "read": "boolean, default false",
  "receivedAt": "Date",
  "title": "string, required",
  "content": "string, required"
}
```

### SystemMessage
```json
{
  "id": "string, format 'message:<uuid>', immutable",
  "userId": "string, immutable",
  "from": "'system', immutable",
  "read": "boolean, default false",
  "receivedAt": "Date",
  "key": "string, required — resolved to localized 'title'/'content' at read time"
}
```

---

## Notes for Integrators

- **CORS:** the API only accepts requests from the origin configured in `FRONT_END_URL`, with `credentials: true`. Cross-origin clients outside that origin cannot authenticate.
- **IDs are prefixed strings**, not raw UUIDs/ObjectIds: tasks are `task:<uuid>`, tags are `tag:<uuid>`, messages are `message:<uuid>`. Always include the prefix when referencing these in URLs or request bodies.
- **Security headers** are applied via Helmet; all cookies are `httpOnly` and `sameSite: strict`, so no CSRF token flow is currently implemented beyond same-site cookie restriction.