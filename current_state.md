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
