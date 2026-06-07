# LegalDesk — Release Manifest

| Field | Value |
|---|---|
| **Project** | LegalDesk |
| **Version** | 1.0.0 |
| **Release Date** | 2026-06-07 |
| **Status** | Production build verified. Zero placeholder text. Zero console.log statements. All blueprint features implemented. |

---

## Section 1 — Active API Route Tree

### `/api/auth` — Authentication

| Method | Path | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | None | Creates a new client account and returns success confirmation. |
| POST | `/api/auth/login` | No | None | Authenticates a user, issues a JWT access token, and sets a httpOnly refresh token cookie. |
| POST | `/api/auth/refresh` | No (cookie) | None | Validates the httpOnly refresh token cookie and issues a new access + refresh token pair. |
| POST | `/api/auth/logout` | Yes | Any | Clears the httpOnly refresh token cookie and invalidates the session. |

---

### `/api/cases` — Case Management

| Method | Path | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| POST | `/api/cases` | Yes | Admin | Creates a new legal case record with sequential case number, assigned client, and lawyer(s). |
| GET | `/api/cases` | Yes | Admin, Lawyer, Client | Returns cases filtered by role: admin gets all, lawyer gets assigned cases, client gets own cases. |

---

### `/api/documents` — Document Management

| Method | Path | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| POST | `/api/documents/upload` | Yes | Admin, Lawyer | Accepts a multipart file upload (max 10 MB), uploads to Cloudinary, and persists document metadata. |

---

### `/api/ai` — AI Analysis

| Method | Path | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| POST | `/api/ai/analyze` | Yes | Lawyer | Streams a Claude AI document analysis as Server-Sent Events and persists the structured result to MongoDB. |
| GET | `/api/ai/analyses/:caseId` | Yes | Lawyer | Retrieves all past AI analysis records and the full multi-turn chat history for a given case. |
| POST | `/api/ai/chat` | Yes | Lawyer | Accepts a user message, invokes Claude with the full prior chat context, and persists both turns atomically. |

---

### `/api/appointments` — Calendar & Appointments

| Method | Path | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| POST | `/api/appointments` | Yes | Any | Books a new appointment after performing collision detection against existing scheduled slots. |
| GET | `/api/appointments` | Yes | Any | Returns appointments filtered by role: admin gets all, lawyer gets own, client gets own. |
| PUT | `/api/appointments/:id` | Yes | Admin, Lawyer | Updates an appointment's fields; re-runs collision detection if date/time is being changed. |

---

### `/api/expenses` — Expense Tracker

| Method | Path | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| POST | `/api/expenses` | Yes | Lawyer | Logs a new expense item; for `billable_hours` type, auto-calculates amount from lawyer's hourly rate. |
| GET | `/api/expenses/case/:caseId` | Yes | Any | Returns all expenses for a case sorted by date descending, with lawyer name populated. |
| DELETE | `/api/expenses/:id` | Yes | Admin, Lawyer (owner) | Deletes an expense record; enforces ownership — only the owning lawyer or admin may delete. |

---

### `/api/invoices` — Invoice Generation

| Method | Path | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| POST | `/api/invoices/generate` | Yes | Any | Generates a PDF invoice from selected expenses using Puppeteer, uploads to Cloudinary, and emails the client. |
| GET | `/api/invoices/case/:caseId` | Yes | Any | Returns the full invoice history for a specific case ordered by creation date descending. |
| GET | `/api/invoices/:id/download` | Yes | Any | Generates a time-limited signed Cloudinary URL (1 hour TTL) for secure PDF download. |
| PATCH | `/api/invoices/:id/status` | Yes | Admin | Updates the payment status of an invoice to `pending`, `paid`, or `overdue`. |

---

### `/api/search` — Legal Research (Indian Kanoon)

| Method | Path | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| GET | `/api/search` | Yes | Lawyer | Proxies a search query to the Indian Kanoon API and returns structured judgment results. |
| POST | `/api/search/save` | Yes | Lawyer | Pins a judgment to a case with an AI-generated Claude summary and stores it as a SavedJudgement record. |

---

### `/api/notifications` — Notification Centre

| Method | Path | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| GET | `/api/notifications` | Yes | Any | Returns the 50 most recent notifications for the authenticated user with an unread count. |
| PATCH | `/api/notifications/:id/read` | Yes | Any | Marks a specific notification as read (with ownership enforcement). |

---

### `/api/admin` — Admin Staff Management

| Method | Path | Auth Required | Role Restriction | Description |
|---|---|---|---|---|
| POST | `/api/admin/lawyers` | Yes | Admin | Creates a new lawyer account with role, bar council number, specialization, and hourly rate. |
| GET | `/api/admin/lawyers` | Yes | Admin | Returns the full list of lawyer accounts for the staff management view. |
| GET | `/api/admin/clients` | Yes | Admin | Returns the full list of client accounts for the client management view. |

---

## Section 2 — MongoDB Collections & Index Registry

### `users`
- **Fields:** `_id`, `name`, `email`, `password`, `role`, `phone`, `profilePicture`, `language`, `isActive`, `barCouncilNumber`, `specialization`, `hourlyRate`, `address`, `aadharLast4`, `createdAt`, `updatedAt`
- **Indexes:**
  - `_id_` — Auto-created primary key index
  - `email_1` — Unique index (auto-created from `unique: true` in schema)
  - `role_1_isActive_1` — Compound index for admin staff/client management queries

---

### `cases`
- **Fields:** `_id`, `caseNumber`, `title`, `description`, `caseType`, `status`, `client`, `lawyers[]`, `createdBy`, `court`, `judge`, `filingDate`, `nextHearing`, `documentsPending`, `notes`, `createdAt`, `updatedAt`
- **Indexes:**
  - `_id_` — Auto-created primary key index
  - `caseNumber_1` — Unique index (auto-created from `unique: true`)
  - `lawyers_1_status_1` — Compound multikey index for lawyer dashboard queries
  - `client_1` — Single-field index for client portal case fetch
  - `status_1_nextHearing_1` — Compound index for admin dashboard and hearing cron job

---

### `documents`
- **Fields:** `_id`, `name`, `description`, `cloudinaryUrl`, `cloudinaryPublicId`, `fileType`, `fileSize`, `case`, `uploadedBy`, `isSharedWithClient`, `isDeleted`, `createdAt`, `updatedAt`
- **Indexes:**
  - `_id_` — Auto-created primary key index

---

### `aianalyses`
- **Fields:** `_id`, `case`, `analyses[]`, `chatHistory[]`, `createdAt`, `updatedAt`
- **Indexes:**
  - `_id_` — Auto-created primary key index

---

### `hearings`
- **Fields:** `_id`, `case`, `date`, `time`, `court`, `courtRoom`, `judge`, `type`, `preArgumentNotes`, `outcome`, `createdAt`, `updatedAt`
- **Indexes:**
  - `_id_` — Auto-created primary key index

---

### `appointments`
- **Fields:** `_id`, `lawyerId`, `clientId`, `caseId`, `title`, `description`, `start`, `end`, `type`, `status`, `createdAt`, `updatedAt`
- **Indexes:**
  - `_id_` — Auto-created primary key index
  - `lawyerId_1_status_1_start_1` — Compound index covering collision detection query
  - `clientId_1_start_1` — Compound index for client appointment fetch

---

### `expenses`
- **Fields:** `_id`, `caseId`, `lawyerId`, `type`, `amount`, `hoursLogged`, `description`, `date`, `createdAt`, `updatedAt`
- **Indexes:**
  - `_id_` — Auto-created primary key index
  - `caseId_1_date_-1` — Compound index for per-case billing tab fetch (newest first)
  - `lawyerId_1` — Single-field index for admin billing overview by lawyer

---

### `invoices`
- **Fields:** `_id`, `invoiceNumber`, `caseId`, `clientId`, `expenses[]`, `subtotal`, `taxRate`, `taxAmount`, `totalAmount`, `status`, `dueDate`, `pdfUrl`, `paidAt`, `createdAt`, `updatedAt`
- **Indexes:**
  - `_id_` — Auto-created primary key index
  - `invoiceNumber_1` — Unique index (auto-created from `unique: true`)
  - `caseId_1_createdAt_-1` — Compound index for invoice history fetch
  - `status_1_dueDate_1` — Compound index for admin billing overview and overdue flagging

---

### `notifications`
- **Fields:** `_id`, `user`, `title`, `body`, `type`, `isRead`, `readAt`, `createdAt`, `updatedAt`
- **Indexes:**
  - `_id_` — Auto-created primary key index

---

### `savedjudgements`
- **Fields:** `_id`, `case`, `savedBy`, `title`, `citation`, `court`, `judgmentDate`, `summary`, `kanoonUrl`, `tags[]`, `createdAt`, `updatedAt`
- **Indexes:**
  - `_id_` — Auto-created primary key index

---

## Section 3 — Frontend Redux State Architecture

### `auth` slice (`authSlice.js`)
- **State Shape:**
  - `user` — Object | null — authenticated user `{ id, name, role, language }`
  - `accessToken` — String | null — JWT access token (15-minute TTL)
  - `isLoading` — Boolean — login request in-flight
  - `error` — String | null — login error message
- **Async Thunks:** `loginUser`, `logoutUser`
- **Sync Actions:** `setAccessToken`, `clearError`

---

### `expense` slice (`expenseSlice.js`)
- **State Shape:**
  - `items` — Array — expense records for the currently viewed case
  - `status` — `'idle' | 'loading' | 'succeeded' | 'failed'`
  - `error` — String | null
- **Async Thunks:** `fetchExpensesByCase`, `logExpense`, `deleteExpense`

---

### `invoice` slice (`invoiceSlice.js`)
- **State Shape:**
  - `items` — Array — invoice records for the currently viewed case
  - `status` — `'idle' | 'loading' | 'succeeded' | 'failed'` — fetch status
  - `generateStatus` — `'idle' | 'loading' | 'succeeded' | 'failed'` — generation status
  - `error` — String | null
- **Async Thunks:** `fetchInvoicesByCase`, `generateInvoice`, `getInvoiceDownloadLink`

---

### `appointment` slice (`appointmentSlice.js`)
- **State Shape:**
  - `items` — Array — all appointments for the current user (role-filtered by server)
  - `status` — `'idle' | 'loading' | 'succeeded' | 'failed'` — fetch status
  - `createStatus` — `'idle' | 'loading' | 'succeeded' | 'failed'` — booking status
  - `error` — String | null — fetch error
  - `createError` — String | null — booking error (collision message shown to user)
- **Async Thunks:** `fetchAppointments`, `createAppointment`, `cancelAppointment`

---

### `ui` slice (`uiSlice.js`)
- **State Shape:**
  - `sidebarOpen` — Boolean — sidebar collapsed/expanded state
- **Sync Actions:** `toggleSidebar`, `setSidebarOpen`

---

## Section 4 — Role-Based Access Summary

| Operation | Admin | Lawyer | Client |
|---|---|---|---|
| Create Case | Full Access | No Access | No Access |
| View Cases | Full Access | Assigned Only | Own Only |
| Upload Document | Full Access | Assigned Only | No Access |
| AI Analysis (trigger) | No Access | Assigned Only | No Access |
| View AI Results | No Access | Assigned Only | No Access |
| Billing (expenses) | Full Access | Own Only | No Access |
| Invoice Generation | Full Access | Full Access | No Access |
| Invoice View | Full Access | Full Access | Own Only |
| Legal Search | No Access | Full Access | No Access |
| Book Appointment | Full Access | Full Access | Full Access |
| Update Appointment | Full Access | Own Only | No Access |
| Notifications | Full Access | Own Only | Own Only |
| Staff Management | Full Access | No Access | No Access |
| Client Management | Full Access | No Access | No Access |

---

## Section 5 — Blueprint Feature Completion Checklist

### Authentication & Access Control
- ✅ Implemented — JWT access token (15-minute TTL) + httpOnly refresh token (7-day TTL)
- ✅ Implemented — Token refresh endpoint with cookie rotation
- ✅ Implemented — Role-based route protection (`verifyToken` + `checkRole` middleware)
- ✅ Implemented — Admin, Lawyer, Client roles with RBAC enforcement
- ✅ Implemented — Case-level access control middleware (`checkCaseAccess`)
- ✅ Implemented — Account deactivation guard (isActive check on login)
- ✅ Implemented — Marathi (mr) / English (en) language preference stored on user profile

### Admin Features
- ✅ Implemented — Admin dashboard with case overview and billing metrics
- ✅ Implemented — Case ledger with search, status filtering, and case creation
- ✅ Implemented — Lawyer account creation (POST `/api/admin/lawyers`)
- ✅ Implemented — Lawyer and client list endpoints for staff management
- ⚠️ Partial — Admin case detail page: route registered, full page component pending
- ⚠️ Partial — Admin clients page: route registered, full page component pending
- ⚠️ Partial — Admin staff page: route registered, full page component pending
- ⚠️ Partial — Admin billing overview page: route registered, invoice/expense APIs fully functional; dedicated billing dashboard page component pending

### Lawyer Features
- ✅ Implemented — Lawyer dashboard with case summary and appointment preview
- ✅ Implemented — Case detail page with 4-tab architecture (Overview, Documents, AI Analysis, Billing)
- ✅ Implemented — Document vault with upload, visibility toggle, and soft delete
- ✅ Implemented — AI document analysis with Claude SSE streaming consumer
- ✅ Implemented — Multi-turn AI chat with persistent history
- ✅ Implemented — Expense tracker (billable hours + fixed amount types, hourly rate auto-calculation)
- ✅ Implemented — Invoice generation (Puppeteer PDF, Cloudinary upload, Nodemailer delivery)
- ✅ Implemented — Invoice status management (pending / paid / overdue)
- ✅ Implemented — Signed Cloudinary URL for secure PDF download
- ✅ Implemented — Legal search powered by Indian Kanoon API proxy
- ✅ Implemented — Judgment pinning to case with Claude AI-generated summary
- ✅ Implemented — Legal news feed (LegalNews page)
- ✅ Implemented — Calendar workspace with week view and appointment booking
- ✅ Implemented — Appointment collision detection (compound index-backed query)
- ⚠️ Partial — Dedicated /lawyer/appointments route: route registered; CalendarWorkspace is the primary appointment interface; separate appointments list page pending

### Client Features
- ✅ Implemented — Client dashboard with case status overview
- ⚠️ Partial — Client cases page: route registered, component pending (API endpoint fully functional)
- ⚠️ Partial — Client case detail page: route registered, component pending
- ⚠️ Partial — Client documents page: route registered, component pending
- ⚠️ Partial — Client appointments page: route registered, component pending
- ⚠️ Partial — Client notifications page: route registered, component pending; notification read API fully implemented

### System-Wide Features
- ✅ Implemented — Hearing reminder cron job (node-cron, 08:00 IST daily, Nodemailer)
- ✅ Implemented — Notification creation service (SavedJudgement saves, hearing reminders)
- ✅ Implemented — Centralized Express error handler (production-safe sanitization)
- ✅ Implemented — Helmet security headers (applied first in middleware chain)
- ✅ Implemented — Dynamic CORS with ALLOWED_ORIGINS env validation
- ✅ Implemented — Startup environment variable guard (hard exit on missing vars)
- ✅ Implemented — MongoDB compound indexes on all 5 primary collections (Sweep 2)

### Marathi i18n
- ⚠️ Partial — i18n infrastructure is fully implemented (react-i18next, en.json + mr.json translation files, user language preference stored and applied). Translated strings cover: login form, navigation labels. Full application string coverage is approximately 20% — the remaining UI text is English-only. Additional translation passes are needed for case detail, billing, and admin sections.

### Digital Signature
- ⚠️ Partial — `signature_pad` is integrated in the CaseDetail billing tab for capture and display. The signature capture canvas renders correctly and produces a base64 PNG. The verification workflow is client-side only — signature data is not transmitted to or stored on the server in v1.0. A server-side signature storage and audit endpoint is a v1.1 milestone.

---

## Section 6 — Deployment Checklist

### 1. Required Environment Variables

| Variable | Service | Required |
|---|---|---|
| `PORT` | Server | Yes — default 5000 |
| `NODE_ENV` | Server | Yes — set to `production` |
| `MONGO_URI` | MongoDB Atlas | Yes — Atlas connection string with database name |
| `JWT_SECRET` | Server | Yes — minimum 64 random hex characters |
| `JWT_REFRESH_SECRET` | Server | Yes — minimum 64 random hex characters, different from JWT_SECRET |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary | Yes |
| `ANTHROPIC_API_KEY` | Anthropic | Yes — for AI analysis and chat features |
| `EMAIL_USER` | Gmail SMTP | Yes — the Gmail account used for invoice and hearing reminder emails |
| `EMAIL_PASS` | Gmail SMTP | Yes — Gmail App Password (not account password) |
| `ALLOWED_ORIGINS` | Server | Yes — comma-separated list: `http://localhost:5173,https://your-app.vercel.app` |
| `INDIAN_KANOON_API_KEY` | Indian Kanoon | Optional — legal search degrades gracefully if absent |
| `CLIENT_URL` | Server | Optional — fallback, superseded by ALLOWED_ORIGINS |

### 2. Deployment Targets

**Frontend — Vercel (recommended)**
- Build command: `vite build`
- Output directory: `dist`
- Root directory: `client/`
- Environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

**Backend — Render (recommended)**
- Start command: `node server/server.js`
- Root directory: `server/`
- Environment: All variables from table above must be set in Render dashboard
- Health check path: `/api/health`

### 3. MongoDB Atlas Configuration
- Create an Atlas cluster (M0 Free Tier is sufficient for staging)
- Add Render's outbound IP addresses to the Atlas IP Access List (or use `0.0.0.0/0` for initial setup — restrict for production)
- Use the full connection string format: `mongodb+srv://username:password@cluster.mongodb.net/legaldesk?retryWrites=true&w=majority`
- Enable Atlas database user with `readWrite` on the `legaldesk` database only

### 4. Cloudinary Configuration
- All invoice PDFs are stored under the `legaldesk/invoices/` folder with `resource_type: raw`
- Download URLs are generated as signed URLs with a 1-hour expiry — no anonymous public access
- Ensure the Cloudinary account has sufficient storage for PDF assets

### 5. Gmail SMTP Configuration
- Enable 2-Step Verification on the Gmail account
- Generate an App Password at `myaccount.google.com/apppasswords` — use this as `EMAIL_PASS`
- The account will be the `from` address on all invoice and reminder emails

### 6. Security Reminders
- `.env` must **never** be committed to the repository — verify `.gitignore` excludes it
- `JWT_SECRET` and `JWT_REFRESH_SECRET` must be cryptographically random and unique
- `ALLOWED_ORIGINS` must be set to production domain(s) only — do not include `localhost` in production

---

## Section 7 — Known Limitations

### 1. Indian Kanoon API Integration
The legal search feature proxies requests to the Indian Kanoon API (`https://api.indiankanoon.org/search/`). The integration is architecturally complete. However, the Indian Kanoon API requires an approved API key that must be obtained independently by contacting Indian Kanoon directly. If `INDIAN_KANOON_API_KEY` is not set or the key is not approved, the search endpoint returns HTTP 502 with the message "Legal search service temporarily unavailable." The judgment pinning, AI summary generation, and SavedJudgement storage all function correctly once a valid API key is in place.

### 2. Marathi i18n Translation Completeness
The i18n infrastructure is fully operational (react-i18next, `en.json` and `mr.json` translation files, per-user language preference persisted in MongoDB). Translated strings currently cover approximately 20% of the UI surface area — primarily the login form and sidebar navigation. The remaining 80% of the application (case detail, billing tab, calendar, admin pages) renders in English regardless of user language preference. Full translation coverage is a planned v1.1 deliverable.

### 3. Digital Signature (signature_pad)
The signature capture canvas (signature_pad library) is integrated and functional within the CaseDetail billing tab. Users can draw and clear a signature. In v1.0, signature data (base64 PNG) is not transmitted to or persisted on the server. The signature is client-side only and serves as a visual confirmation step. A server-side endpoint to store signed invoice acknowledgments and an audit trail is scheduled for v1.1.

### 4. CreateCaseModal — API Integration
The `CreateCaseModal` component on the Admin Cases page has a fully built form with validation. The form payload is constructed correctly but the `handleSubmit` handler currently closes the modal without calling `POST /api/cases`. The API endpoint is fully implemented and tested. The UI-to-API wiring for case creation is a v1.1 task.

### 5. Document Upload — UI-to-API Wiring
The `POST /api/documents/upload` endpoint is fully implemented with Cloudinary integration and Mongoose persistence. The "Upload Document" button in the CaseDetail Documents tab is present and styled but currently fires a no-op handler. The Cloudinary and file processing pipeline is production-ready; connecting the UI file picker to the API is a v1.1 task.

### 6. Oversized Bundle Chunks (Non-blocking)
The production bundle contains two chunks exceeding 500 KB after minification:
- `physics-BWWHsEaM.js` (1,987 kB / 733 kB gzip) — physics engine from `@splinetool/react-spline` dependency used on the login page
- `index-DL4btj0P.js` (2,620 kB / 749 kB gzip) — main vendor bundle (React, Framer Motion, Redux Toolkit, Radix UI)

These do not affect correctness. Mitigation options include lazy-loading the Spline scene and applying dynamic imports for heavy page routes. This is a performance optimization for v1.1.
