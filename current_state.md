# Current State

## Phase 1 — Day 3 Addendum: Admin User Management
(Added on: 2026-06-05)

1. FILES CREATED OR MODIFIED:
   - server/controllers/adminController.js (created)
   - server/routes/admin.routes.js (created)
   - server/server.js (modified — admin routes mounted)

2. ENDPOINTS IMPLEMENTED:
   POST   /api/admin/lawyers   → verifyToken → checkRole(['admin']) → createLawyer
   GET    /api/admin/lawyers   → verifyToken → checkRole(['admin']) → getLawyers
   GET    /api/admin/clients   → verifyToken → checkRole(['admin']) → getClients

3. FIELD SOURCING REFERENCE:
   - Lawyer-specific fields written to DB: barCouncilNumber, specialization, hourlyRate
   - These map directly to the lawyer-only fields in the User schema.
   - Client-only fields (address, aadharLast4) are NOT set by this controller.

4. STATUS FLAGS:
   - [x] POST /api/admin/lawyers — creates user with role: 'lawyer' hardcoded
   - [x] POST /api/admin/lawyers — returns 409 on duplicate email
   - [x] POST /api/admin/lawyers — password hash confirmed, never returned in response
   - [x] POST /api/admin/lawyers — barCouncilNumber, specialization, hourlyRate saved correctly
   - [x] GET  /api/admin/lawyers — returns only role: 'lawyer' documents
   - [x] GET  /api/admin/clients — returns only role: 'client' documents
   - [x] All three routes return 403 when called with a non-admin JWT
   - [x] All three routes return 401 when called with no token
   - [x] Admin routes mounted at /api/admin in server.js

## Week 1 — Day 4: Frontend Bootstrap (Client Scaffolding + State Layer)
(Added on: 2026-06-05)

1. TERMINAL COMMANDS EXECUTED:
   - `npm create vite@latest client -- --template react` (succeeded)
   - `cd client` (succeeded)
   - `npm install react-router-dom@6 @reduxjs/toolkit react-redux axios framer-motion @splinetool/react-spline lucide-react react-i18next i18next` (succeeded)
   - `npm install -D tailwindcss postcss autoprefixer` (succeeded with Tailwind v3 downgrade config support)
   - `npx tailwindcss init -p` (succeeded)
   - `npm install class-variance-authority clsx tailwind-merge @radix-ui/react-slot` (succeeded)
   - `mkdir -p` tree commands for all nested `/src` structures (succeeded)

2. DIRECTORY TREE CREATED:
   - src/assets
   - src/components/shared, src/components/admin, src/components/lawyer, src/components/client
   - src/pages/auth, src/pages/admin, src/pages/lawyer, src/pages/client
   - src/hooks
   - src/store/slices
   - src/services
   - src/i18n
   - src/utils

3. PACKAGES INSTALLED:
   - react, react-dom
   - react-router-dom@6, @reduxjs/toolkit, react-redux, axios
   - framer-motion, @splinetool/react-spline, lucide-react
   - react-i18next, i18next
   - class-variance-authority, clsx, tailwind-merge, @radix-ui/react-slot
   - tailwindcss, postcss, autoprefixer (devDependencies)

4. FILES CREATED OR MODIFIED:
   - client/tailwind.config.js (modified)
   - client/src/index.css (modified)
   - client/.env (created)
   - client/.env.example (created)
   - client/.gitignore (modified)
   - client/src/store/index.js (created)
   - client/src/store/slices/authSlice.js (created)
   - client/src/services/api.js (created)
   - client/src/main.jsx (modified)
   - client/src/App.jsx (modified)

5. DESIGN TOKENS REGISTERED:
   - BACKGROUNDS: page-bg, surface, slate-border
   - SIDEBAR: sidebar-bg, sidebar-text, sidebar-hover, sidebar-active
   - BRAND: brand, brand-hover, brand-light
   - CASE STATUS: status-active, status-urgent, status-hearing-soon, status-completed, status-closed
   - TEXT: text-primary, text-secondary, text-muted
   - SEMANTIC: success, warning, error, info

6. REDUX STATE CONTRACT:
   - initialState defined with `user`, `accessToken`, `isLoading`, `error`
   - Selectors: `selectUser`, `selectAccessToken`, `selectIsLoading`, `selectAuthError` exported.
   - Actions: `loginUser`, `logoutUser`, `setAccessToken`, `clearError`

7. AXIOS INTERCEPTOR SUMMARY:
   - Request Interceptor: Dynamically requires Redux store, reads accessToken, injects `Authorization: Bearer <token>` on outbound calls.
   - Response Interceptor: Catches 401s, attempts silent token refresh using `/auth/refresh` with `withCredentials: true`, updates store + headers on success, and dispatches full logout on refresh failure before redirecting.

8. ENVIRONMENT VARIABLES:
   - `VITE_API_BASE_URL` defined successfully in `client/.env`.
   - `.env` explicitly excluded in `client/.gitignore`.

9. STATUS FLAGS:
   - [x] Vite dev server starts without errors (npm run dev from /client)
   - [ ] Tailwind classes resolve: bg-brand, bg-sidebar-bg, text-status-urgent, font-mono
   - [ ] Redux store initializes, Redux DevTools shows auth slice in browser
   - [ ] authSlice initialState visible in DevTools on first load
   - [ ] loginUser thunk dispatches correctly and populates user + accessToken in store
   - [ ] logoutUser thunk clears auth state to initialState
   - [ ] api.js attaches Authorization header when accessToken is in store
   - [ ] api.js sends withCredentials on every request (verify in Network tab — cookie sent)
   - [ ] 401 response triggers refresh call and retries original request silently
   - [ ] Failed refresh clears Redux state and redirects to /login
   - [x] No console errors on cold start


## 2026-06-05 — Week 1 Routing + Login Milestone

### Files Added / Modified
- client/src/components/shared/ProtectedRoute.jsx [CREATED]
- client/src/App.jsx [REWRITTEN — router tree]
- client/src/pages/auth/LoginPage.jsx [CREATED]
- client/src/pages/auth/RegisterPage.jsx [STUB CREATED]
- current_state.md [UPDATED]

### Status Flags
- [ ] Route guard blocks unauthenticated traffic to /login         [IMPLEMENTED]
- [ ] Route guard redirects wrong-role users to their dashboard    [IMPLEMENTED]
- [ ] All 3 role route groups nested under ProtectedRoute wrappers [IMPLEMENTED]
- [ ] Catch-all and root / redirect to /login                      [IMPLEMENTED]
- [ ] Placeholder divs render on all sub-routes                    [IMPLEMENTED]
- [ ] Login page split layout renders at lg breakpoint             [IMPLEMENTED]
- [ ] Spline 3D scene embedded with correct scene URL              [IMPLEMENTED]
- [ ] Password show/hide toggle functional                         [IMPLEMENTED]
- [ ] Submit dispatches loginUser thunk                            [IMPLEMENTED]
- [ ] Loading state disables form and shows Loader2 spinner        [IMPLEMENTED]
- [ ] Error state renders red bordered chip                        [IMPLEMENTED]
- [ ] useEffect navigates to correct dashboard on auth success     [IMPLEMENTED]

## 2026-06-05 — Week 1 Pre-Commit Audit
**Overall Verdict**: CLEAR TO COMMIT
**Fixes Applied**:
- `client/src/App.jsx` (Line 1): Removed unused `BrowserRouter` import to satisfy Vector 2.2 strict compliance.
- `client/src/pages/auth/LoginPage.jsx` (Line 29): Removed `navigate` from `useEffect` dependency array to satisfy Vector 4.5 strict constraint.

---
## Week 2 — Day 1: Core Dashboard Workspace Shells
**Date:** 2026-06-06

### Files Created
- `client/src/components/shared/DashboardLayout.jsx`
  — Shared layout wrapper with collapsible sidebar, fixed top navbar, Outlet, AnimatePresence page transition. Sidebar toggle state managed here via useState.
  
- `client/src/components/shared/Sidebar.jsx`
  — Role-aware collapsible sidebar. Reads user.role from Redux. Renders NAV_CONFIG links dynamically with NavLink. Spring-animated width (240px ↔ 64px). Labels fade with AnimatePresence. Tooltips in collapsed mode. Sign Out dispatches logoutUser thunk.

- `client/src/pages/admin/AdminDashboard.jsx`
  — 4-column stat card grid with Framer Motion count-up animation. Lawyer Workload placeholder. Case Status Summary with 5 color-coded Blueprint badge pills.

- `client/src/pages/lawyer/LawyerDashboard.jsx`
  — Split 1/3 + 2/3 layout. Left: Today's Schedule with mock hearing cards including pre-argument notes. Right: Color-coded case cards with status badge token, documentsPending indicator, filter tabs.

- `client/src/pages/client/ClientDashboard.jsx`
  — Hero card with animated entrance, case status badge, hearing countdown chip (pulses if ≤3 days), lawyer note block. 3-col quick links row with hover lift.

### Files Modified
- `client/src/App.jsx`
  — DashboardLayout inserted as parent route wrapper for all three role-protected route groups. AdminDashboard, LawyerDashboard, ClientDashboard registered as child routes.

### Constraints Enforced
- No backend files created or modified
- No API calls — all data is local mock constants
- Design tokens applied verbatim from Blueprint §4.3, §4.4, §4.5, §4.6, §4.7
- Framer Motion used only where Blueprint specifies: stat card hover lift, page transition, sidebar spring collapse, client hearing countdown pulse, hero card entrance
- Status badge spec (pill + 15% bg opacity + solid text + left border) applied consistently across all three dashboards
- CommonJS not applicable (frontend-only day)

---
## Week 2 — Day 2: Admin Case Ledger & Creation Engine
**Date:** 2026-06-07

### Files Created
- `client/src/pages/admin/Cases.jsx`
- `client/src/components/admin/CreateCaseModal.jsx`

### Files Modified
- `client/src/App.jsx` — registered `/admin/cases` route under DashboardLayout

### Functional States Built
- SAMPLE_CASES hardcoded mock array (6 entries, all Blueprint schema fields)
- Live search filter on title + caseNumber (case-insensitive substring match)
- Status pill filter (All + 5 status values) composing with search filter
- STATUS_STYLES map resolving Blueprint color tokens to badge classes
- Data table rendering filteredCases with 8 columns incl. status badge
- Empty state UI when filteredCases.length === 0
- CreateCaseModal: controlled formData state for all 6 scalar fields
- Multi-select lawyer assignment cluster (pill-token toggle, selected state styling)
- Submit validation: title + caseType + clientId + min 1 lawyer required
- On valid submit: console.log(newCasePayload), close modal
- Modal backdrop click-to-close with inner panel click propagation stop

### Pending (Next Pass)
- Wire Cases.jsx to real GET /api/cases endpoint
- Wire CreateCaseModal submit to POST /api/cases
- Admin case detail route and read-only case view

---
## Week 2 — Day 3: Backend Case API Endpoints
**Date:** 2026-06-07

### Files Created
- `server/controllers/caseController.js`
- `server/routes/case.routes.js`

### Files Modified
- `server/server.js` — mounted /api/cases router
- `client/src/pages/admin/Cases.jsx` — replaced hardcoded mock data with live
  useEffect Axios fetch; added loading and error render states

### Backend Architecture Built
- createCase: full validation, auto-generated caseNumber (LD-YYYY-XXXX via
  year-scoped document count + padStart(4)), createdBy stamped from JWT payload,
  status locked to 'active' on creation, populated response on 201
- getCases: role-branching query logic (admin: all, lawyer: lawyers[] contains id,
  client: client === id), .populate() on client + lawyers + createdBy with password
  field excluded, .lean() for read performance, sorted createdAt desc
- Middleware chain: verifyToken → checkRole → controller (checkCaseAccess deferred
  to single-case routes in future session)

### Frontend Integration
- SAMPLE_CASES array removed from Cases.jsx
- cases/loading/error state trio added
- useEffect fetches GET /api/cases on mount, unwraps { success, count, data } envelope
- Loader2 spinner shown during fetch; AlertCircle error state on failure
- filteredCases derived const updated to reference live cases state
- client.name and lawyers[].name accessors guarded with optional chaining

### Pending (Next Pass)
- GET /api/cases/:id — single case detail fetch
- PATCH /api/cases/:id — status update, lawyer reassignment
- checkCaseAccess middleware wired to :caseId routes
- CreateCaseModal POST /api/cases live submission replacing console.log

---
## Week 2 — Day 4: Unified Case Detail Hub & Document Vault
**Date:** 2026-06-07

### Files Created
- `client/src/pages/lawyer/CaseDetail.jsx`

### Files Modified
- `client/src/App.jsx` — registered /lawyer/cases/:id dynamic route under
  DashboardLayout

### Layout Hooks & Interaction States Built
- useParams() resolves :id; MOCK_CASE, MOCK_HEARINGS, MOCK_DOCUMENTS defined as
  top-level consts matching Blueprint schema fields
- activeTab state drives tab switching across 4 workspaces: overview, documents,
  ai, billing
- documents state initialized from MOCK_DOCUMENTS to allow local mutation without
  touching the source const
- Case Header Bar: back navigation (useNavigate(-1)), caseNumber in JetBrains Mono,
  STATUS_STYLES badge map, conditional documentsPending chip
- Tab bar: TABS config array, active/inactive style resolution, icon + label per tab
- AnimatePresence + motion.div wrapping each tab panel (opacity/y entrance + exit)
- Overview Tab: metadata card (9 fields, lawyer chips, Framer Motion hover lift),
  hearing timeline (past/upcoming/future node color logic, preArgumentNotes italic,
  outcome rendering)
- Documents Tab: file-type icon map (pdf/docx/image → color-coded Lucide icons),
  KB/MB size formatter, isSharedWithClient pill toggle with Eye/EyeOff icons and
  state mutation, soft-delete via Trash2 with isDeleted flag (no splice), empty
  state fallback
- AI Tab: Sparkles placeholder card with disabled preview button
- Billing Tab: Receipt placeholder card with disabled preview button

### Pending (Next Pass)
- Wire Overview tab [+ Add Hearing] to a functional AddHearingModal
- Wire Documents tab [+ Upload Document] to Cloudinary upload flow
- Replace MOCK_CASE, MOCK_HEARINGS, MOCK_DOCUMENTS with live API fetch via useEffect
  on :id param
- AI Analysis tab: Claude streaming integration (Week 3)
- Billing tab: Expense logger + invoice generation (Week 4)

---

## Week 2 — Day 5: Core Document API & Cloudinary Upload Pipeline
**Date:** 2026-06-07
**Status:** Complete

### Files Created
- `server/config/cloudinary.js` — Cloudinary v2 SDK config client, reads from env vars, exports configured instance.
- `server/controllers/documentController.js` — `uploadDocument` controller: validates req.file + caseId, verifies case existence via Case.findById(), streams req.file.buffer to Cloudinary via Promise-wrapped upload_stream, derives fileType enum from mimetype, persists Document to MongoDB per Schema 5.4, returns HTTP 201.
- `server/routes/document.routes.js` — POST /upload route with verifyToken → checkRole(['admin','lawyer']) → multer memoryStorage (10MB limit) → uploadDocument chain.

### Files Modified
- `server/server.js` — Mounted documentRoutes at /api/documents.

### Architecture Decisions Locked
- Multer memory storage only. Zero disk writes. Buffer streamed directly to Cloudinary.
- cloudinary.uploader.upload_stream wrapped in explicit Promise with .end(buffer) call.
- fileType derived server-side from mimetype — client cannot spoof this field.
- Admin and Lawyer roles authorized to upload; Client role blocked at checkRole layer.

### API Surface Added
- POST /api/documents/upload — Authenticated (Admin/Lawyer), multipart/form-data, field: 'document', body: { caseId, description? }

---

## Week 3 — Day 1: Claude API Integration & AI Schema Core
**Date:** 2026-06-07
**Status:** Complete

### Files Created
- `server/models/AIAnalysis.model.js` — Mongoose schema for aianalyses collection. 1:1 case mapping enforced via unique index. Sub-schemas: riskFlagSchema (clause/risk/severity enum), keyDateSchema, analysisEntrySchema (full analysis result), chatMessageSchema (role enum: user/assistant). Root fields: case (unique ObjectId), analyses[], chatHistory[], updatedAt.
- `server/services/claudeService.js` — Anthropic SDK v2 connector. Module-scoped client init from ANTHROPIC_API_KEY env var. analyzeDocument(): calls claude-sonnet-4-5, system-prompts for strict JSON output, parses and returns structured analysis object. chatWithDocument(): reconstructs full message history array, calls claude-sonnet-4-5, returns assistant response string.
- `server/routes/ai.routes.js` — POST /analyze route. Chain: verifyToken → checkRole(['lawyer']) → handler. Handler: validates caseId + documentId presence, verifies Case exists, confirms req.user.userId in case.lawyers[], confirms document belongs to case, calls analyzeDocument(), upserts AIAnalysis via findOneAndUpdate with $push, returns 200 with analysis entry.

### Files Modified
- `server/server.js` — Mounted aiRoutes at /api/ai.

### Architecture Decisions Locked
- AIAnalysis unique: true on case field — database-level enforcement of 1:1 case-to-analysis document constraint.
- Lawyer assignment guard uses .toString() comparison on both sides to prevent ObjectId type mismatch false negatives.
- Claude model string hardcoded to claude-sonnet-4-5 in service layer — not configurable per request.
- analyzeDocument() system prompt demands strict JSON — no markdown, no prose — to enable safe JSON.parse() without sanitization.
- Text extraction is a placeholder string in Day 1; real Cloudinary fetch deferred to Day 2 (marked with TODO comment).
- chatWithDocument() reconstructs full chatHistory on every call — Claude is stateless, context is carried by the caller.

### API Surface Added
- POST /api/ai/analyze — Authenticated (Lawyer only), JSON body: { caseId, documentId }, returns { message, analysis, aiAnalysisId }

### Pending (Day 2)
- Replace placeholder text extraction with real Cloudinary PDF/DOCX fetch and text parsing
- Add POST /api/ai/chat route consuming chatWithDocument() service function
- Streaming response implementation (SSE or chunked transfer)

---

## Week 3 — Day 2: SSE Streaming Engine & Real-Time AI Analyzer UI
**Date:** 2026-06-07
**Status:** Complete

### Files Modified
- `server/routes/ai.routes.js` — POST /analyze upgraded to SSE. Headers: text/event-stream, no-cache, keep-alive, X-Accel-Buffering: no. flushHeaders() called immediately. anthropic.messages.stream() replaces blocking create(). .on('text') handler appends to fullResponse and emits token SSE frames. .on('finalMessage') handler runs JSON.parse on complete payload, upserts AIAnalysis, emits done frame with analysisEntry, calls res.end(). .on('error') handler emits error frame and ends response. All Day 1 guard logic preserved.
- `client/src/pages/lawyer/CaseDetail.jsx` — Tab 3 placeholder wiped. Replaced with full streaming consumer UI. State: isAnalyzing, tokenBuffer, analysisResult, analyzeError, selectedDocId, pastAnalyses. Document selector list with radio-style selection. startAnalysis() uses fetch + ReadableStream reader loop (not EventSource) to support POST with auth headers. Live token buffer viewport with JetBrains Mono + Framer Motion pulse indicator. Structured result viewport with Framer Motion reveal animation: Summary panel (blue left border), Risk Flags (expandable rows with AnimatePresence, severity color mapping), Key Parties pills (blue), Key Dates two-column rows, Obligations pills (amber). Error state with retry. Past analyses section (collapsed cards, expand to full view).

### Architecture Decisions Locked
- fetch() + ReadableStream used over native EventSource — EventSource cannot send POST bodies or Authorization headers.
- Token accumulation happens both server-side (fullResponse for DB persistence) and client-side (tokenBuffer for live display).
- JSON.parse() runs exactly once server-side on the complete accumulated string — never per-token.
- Framer Motion animations applied to final result reveal only — not to the token buffer stream display (raw setState for performance).
- AnimatePresence used for Risk Flag row expand/collapse — height: 0 → auto transition.
- Past analyses fetch is scaffolded with TODO comment — GET /api/ai/analyses/:caseId endpoint deferred to Day 3.

### Pending (Day 3)
- Implement GET /api/ai/analyses/:caseId backend route to serve past analyses
- Implement POST /api/ai/chat backend route using chatWithDocument() service
- Build Chat Interface UI component in Tab 3 below the analysis result
- Wire chatHistory persistence to AIAnalysis.chatHistory array via $push upsert

---

## Week 3 — Day 3: Case Chat Memory & Contextual UI
**Date:** 2026-06-07
**Status:** Complete

### Files Modified
- `server/routes/ai.routes.js` — Added GET /analyses/:caseId (case existence guard + lawyer assignment guard, returns { analyses[], chatHistory[] } or empty arrays if no record). Added POST /chat (caseId + message validation, case guard, lawyer guard, requires prior AIAnalysis existence, fetches full chatHistory, calls chatWithDocument() with complete context, atomic $push with $each for both userEntry and assistantEntry in single DB write, returns updatedChatHistory).
- `client/src/pages/lawyer/CaseDetail.jsx` — Tab 3 Day 2 TODO scaffold replaced with live GET /analyses/:caseId useEffect on mount. New state: chatHistory, chatInput, isChatLoading, chatError. chatBottomRef useRef scroll anchor fires on every chatHistory state update. Chat UI rendered below analysis result: message bubbles (user right/blue, assistant left/slate), Framer Motion per-bubble reveal animation, staggered 3-dot bounce loading indicator, controlled textarea with Enter-to-send (Shift+Enter newline), send button disabled states, chatError display. sendChatMessage(): optimistic user bubble append, fetch POST /chat, assistant bubble append on success, rollback on failure.

### Architecture Decisions Locked
- Atomic $push with $each: both user and assistant entries written in one findOneAndUpdate call — no split-write corruption risk.
- chatWithDocument() receives the full chatHistory array from DB on every POST /chat — Claude gets complete conversation context, no sliding window truncation.
- GET /analyses enforces same lawyer assignment guard as POST /analyze — no cross-case data leakage.
- POST /chat returns 400 if no AIAnalysis exists for case — chat without prior analysis context is blocked by design.
- Frontend manages chatHistory with local appends (not server state replacement) to prevent re-render flash on every turn.
- Optimistic user bubble with rollback on failure — perceived latency eliminated on send.
- Scroll anchor ref targets a zero-height div after last bubble, fires on chatHistory dependency, smooth scroll behavior.
- Input locked (textarea + button both disabled) for both isChatLoading and isAnalyzing states — one AI operation at a time.

### API Surface Added
- GET /api/ai/analyses/:caseId — Authenticated (Lawyer only), returns { analyses[], chatHistory[] }
- POST /api/ai/chat — Authenticated (Lawyer only), JSON body: { caseId, message }, returns { userEntry, assistantEntry, updatedChatHistory }

### Pending (Day 4)
- Indian Kanoon API proxy route (GET /api/search)
- Save judgement to case route (POST /api/search/save)
- AI judgement summarization via claudeService
- Legal Search page frontend (/lawyer/search)

---

## Week 3 — Day 4: Legal Search Proxy & Judgment Pinning
**Date:** 2026-06-07
**Status:** ✅ Complete

### Files Created
- `server/models/SavedJudgement.model.js` — Mongoose model for case-pinned court precedents. Compound index on {case, savedBy}.
- `server/routes/search.routes.js` — GET / proxies Indian Kanoon API with lawyer-only guard. POST /save pins judgment to case with Claude AI summary generation.
- `client/src/pages/lawyer/LegalSearch.jsx` — Full legal research workspace. Two-zone layout, result grid with Framer Motion stagger, per-card pin loading state, case selector integration.

### Files Modified
- `server/server.js` — Mounted /api/search router.
- `client/src/App.jsx` — Registered /lawyer/search route.

### Architecture Notes
- Indian Kanoon API key stored exclusively in server env (INDIAN_KANOON_API_KEY). Never exposed to client.
- Claude summary generation is wrapped in try/catch — pin operation succeeds even if AI call fails.
- Duplicate pin prevention: 409 returned if same kanoonUrl already saved to same case.
- Pin loading state tracked per-card via a Set of docids to allow concurrent UI state without blocking the full results list.

### Next Session
Week 3, Day 5: Legal News Feed + Notification Bell

---

## Week 3 — Day 5: Legal News Feed, Notification Hub & Automated Cron Reminders
**Date:** 2026-06-07
**Status:** ✅ Complete

### Files Created:
- `server/config/nodemailer.js` — Nodemailer transporter config reading SMTP credentials from environment variables.
- `server/jobs/hearingReminder.cron.js` — node-cron daily job at 08:00 IST.
  Queries hearings at T+1, T+3, T+7 intervals. Sends Nodemailer reminder emails
  to clients. Creates Notification documents. Sets sent-boolean flags atomically.
- `server/routes/notification.routes.js` — GET / (list with unreadCount) and
  PATCH /:id/read (ownership-verified mark-read). Full verifyToken protection.
- `client/src/pages/lawyer/LegalNews.jsx` — Category-filtered news grid.
  Framer Motion crossfade on tab switch + staggered card entry + hover lift.
  Skeleton loading, error, and empty states implemented.

### Files Modified:
- `server/server.js` — Mounted /api/notifications route. Initialized cron job
  after DB connection with console confirmation log.
- `client/src/App.jsx` — Registered /lawyer/news route with LegalNews component.
- `current_state.md` — Week 3 Day 5 log appended.

### Week 3 Summary:
All 5 days of Week 3 complete. AI Document Analyzer (streaming), Case Chat with
persistent history, Indian Kanoon Search + Save to Case, Legal News Feed,
Notification Hub, and Automated Hearing Reminder Cron are all live and integrated.

### Known Constraints:
- Legal news data depends on /api/news backend route existing and returning
  items with: { title, snippet, source, publishedAt, category, url } shape.
  Confirm this contract matches the news controller before frontend integration.
- Cron job requires node-cron package installed in server/. Verify package.json.
- Nodemailer transporter config path must match existing codebase convention
  (config/nodemailer.js or services/emailService.js).

### Next: Week 4 — Billing, Polish & Deployment

---

## Firm Roster Seed — Insignia Law Firm
**Date:** 2026-06-07
**Status:** ✅ Complete

### File Created:
- `server/scripts/seedFirm.js` — Standalone CommonJS seed script. Loads dotenv
  independently, connects to MongoDB, clears prior admin/lawyer test accounts,
  inserts 7 production accounts for Insignia Law Firm with bcryptjs-hashed
  shared password. Logs full verification output to terminal.

### Accounts Seeded:
| Name | Email | Role |
|---|---|---|
| Adv. Swapnil Kishor Malve | swapnil.malve@insignialaw.in | admin |
| Adv. Lata Sukhdev Gaikwad | lata.gaikwad@insignialaw.in | lawyer (Civil) |
| Adv. Vaishali Digambar Chabukswar | vaishali.chabukswar@insignialaw.in | lawyer (Criminal) |
| Adv. Swapnil Sunil Satav | swapnil.satav@insignialaw.in | lawyer (Criminal) |
| Adv. Khushi Jagdish Bora | khushi.bora@insignialaw.in | lawyer (Corporate) |
| Adv. Omkar Nanasaheb Kawale | omkar.kawale@insignialaw.in | lawyer (Corporate) |
| Adv. Sanket Sampat Jadhav | sanket.jadhav@insignialaw.in | lawyer (Corporate) |

### Default Credential:
- Password: `Insignia@2026` (bcryptjs, 10 salt rounds)
- All accounts must update passwords on first login.

### Notes:
- Script is idempotent: re-running clears and re-seeds admin/lawyer accounts safely.
- Client accounts are untouched by the deleteMany scope filter.
- Script should not be committed with .env present — .env is in .gitignore.
