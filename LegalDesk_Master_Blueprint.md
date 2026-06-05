# LegalDesk — Master Project Blueprint
> Version 1.0 | Status: Approved for Development
> This document is the single source of truth for the entire project.
> No feature, design decision, or schema change is valid unless it is reflected here first.

---

# DOCUMENT 1 — PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1.1 Product Vision

LegalDesk is a unified, AI-powered case and firm management system for Indian law firms.
It saves lawyers hours of manual work through intelligent document analysis, automated
deadline tracking, and centralized case management — while giving clients full
transparency into their case status.

**One-line pitch:** The complete operating system for an Indian law firm.

---

## 1.2 The Problem It Solves

Indian law firms today manage cases across WhatsApp messages, physical files, personal
diaries, and Excel sheets. The result:
- Missed hearing dates
- Lost documents
- Zero client visibility
- Hours wasted reading contracts manually
- No billing discipline

LegalDesk replaces all of that with one platform.

---

## 1.3 User Personas

### Admin — Sunita
- **Role:** Firm operations manager and gatekeeper
- **Key pain:** No single view of the entire firm — cases, lawyers, billing, workload
- **What she needs:** Create cases, assign lawyers, track all deadlines, manage invoicing
- **Critical rule:** Only the Admin can create cases. Only the Admin can create Lawyer accounts.

### Lawyer — Adv. Mehta
- **Role:** Handles assigned cases, appears in court, manages documents
- **Key pain:** Spends hours manually reading contracts; misses deadlines; can't track bills
- **What he needs at 9am before court:** Case status overview, today's hearing schedule, key pre-argument notes for today's cases
- **Critical rule:** A Lawyer can only access cases assigned to them by Admin.

### Client — Priya
- **Role:** Has engaged the firm for a legal matter
- **Key pain:** No visibility — she has no idea what's happening with her case
- **What she needs on login:** Her case status, the next hearing date, and any message from her lawyer
- **Critical rule:** A Client can only see their own cases. They cannot see AI analysis results or billing details.

---

## 1.4 Core Feature Requirements

### MODULE 1 — Authentication & Access Control

| Feature | Requirement | Owner |
|---|---|---|
| Login | Email + password. JWT session. | All roles |
| Register | Client self-registers via public form | Client only |
| Create Lawyer account | Admin creates lawyer accounts only | Admin |
| Role-based dashboard | Completely different UI per role on login | System |
| Language toggle | English / Marathi toggle persistent per user | All roles |

### MODULE 2 — Admin Features

| Feature | Requirement |
|---|---|
| Firm Dashboard | Total active cases, closed this month, total revenue, pending invoices, lawyer workload bar chart, case status summary |
| Case Creation | Admin creates all cases: assigns client, assigns one or more lawyers, sets case type, sets first hearing |
| Case Management | Full CRUD on all cases. Assign/reassign lawyers. Change status. |
| Client Management | Create client accounts. Link clients to cases. View client list. |
| Staff Management | Create lawyer accounts. View lawyer performance: cases handled, resolution time, revenue |
| Billing Overview | All invoices across firm. Payment status. Mark as paid. |

### MODULE 3 — Lawyer Features

| Feature | Requirement |
|---|---|
| Lawyer Dashboard | Today's hearings, color-coded case cards, pre-argument notes for today's cases |
| Case Detail Page | Full case view: status, hearings timeline, documents, AI analysis, expenses, appointments, saved judgements |
| Document Vault | Upload PDF/DOCX to a case. Mark docs as shared with client. Soft delete (audit trail) or hard delete. Version history. |
| AI Document Analyzer | Upload a document → Claude API generates: summary, risk flags, key parties, key dates, obligations. Results saved permanently to case. |
| Chat with Document | Case-specific AI chat. Remembers full conversation history for that case. Not a fresh chat each time. |
| Deadline Calendar | Monthly/weekly calendar of all hearings and filing deadlines. Color-coded: red this week, yellow next week, green later. |
| Pre-Argument Notes | Lawyer can write notes per hearing. Shown on dashboard on the day of the hearing. |
| Expense Tracker | Log billable hours and expenses per case. Auto-calculates totals. |
| Invoice Generation | Generate invoice from expenses. Export as PDF. |
| Indian Kanoon Search | Search for judgements and bare acts. Save/pin results to a specific case. |
| Legal News Feed | Filtered legal news inside the app by category: Supreme Court, High Court, Legislation. |
| Appointments | View all client appointments. Confirm / cancel. |
| Digital Signature | Lawyer signs documents digitally within the platform. Signature is timestamped and saved. |

### MODULE 4 — Client Features

| Feature | Requirement |
|---|---|
| Client Dashboard | Active case status (color-coded), next hearing with countdown, latest message/note from lawyer |
| Case Timeline | Chronological list of all events, hearings, actions on their case |
| Documents | View and download only documents the lawyer has explicitly shared with them |
| Appointment Booking | View lawyer availability. Book consultation. Status: Pending → Confirmed → Completed / Cancelled |
| Notifications | All hearing reminders and document alerts in one place |

### MODULE 5 — System-Wide Features

| Feature | Requirement |
|---|---|
| Email Reminders | Automated emails sent to CLIENT 7 days, 3 days, and 1 day before each hearing |
| Document Pending Badge | Persistent badge on any case where required documents are missing |
| Color Coding | Active: Blue, Urgent: Red, Hearing Soon: Yellow, Completed: Green, Closed: Gray — consistent across all dashboards |
| Marathi / English | Hard requirement. All UI text switchable. Persistent per user account. |
| Collapsible Sidebar | Sidebar can collapse to icon-only mode to save screen space |

---

## 1.5 What Is Explicitly OUT of Scope

- Audio / video calling — removed
- Payment gateway — removed
- Offline access — removed
- Admin accessing AI analysis results (security rule — see Document 7)
- Mobile app (desktop-first; mobile-friendly is a secondary enhancement)

---

# DOCUMENT 2 — TECHNICAL REQUIREMENTS DOCUMENT (TRD)

## 2.1 Full Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend Framework | React 18 + Vite | You know this stack. Fast dev server. |
| Styling | Tailwind CSS | You know this. Rapid, consistent styling. |
| Component Library | Shadcn/ui | Production-grade accessible components, customizable |
| Animations | Framer Motion | Smooth page transitions, micro-interactions, card animations |
| 3D Elements | Spline (spline.design) | Embedded 3D scene on login page. Zero Three.js complexity. |
| State Management | Redux Toolkit | Centralized state, async thunks for API calls |
| Routing | React Router v6 | Protected routes, role-based redirects |
| i18n | react-i18next | English + Marathi toggle |
| HTTP Client | Axios | API calls with interceptors for token refresh |
| Backend | Node.js + Express.js | You know this from Avadhoot project |
| Database | MongoDB + Mongoose | You know this. Flexible schema, good for document-heavy data |
| Auth | JWT + bcrypt | Access token (15 min) + Refresh token (7 days) in httpOnly cookies |
| File Storage | Cloudinary | You know this from Avadhoot. PDF/DOCX upload |
| AI | Anthropic Claude API (claude-sonnet-4-5) | Document analysis, risk flagging, chat |
| Email | Nodemailer + Gmail SMTP | Automated hearing reminders |
| PDF Generation | Puppeteer | Invoice PDF export |
| Digital Signature | signature_pad (npm) | In-browser canvas signature |
| Scheduled Jobs | node-cron | Daily cron to check upcoming hearings and send reminder emails |
| Legal Search | Indian Kanoon API | Judgement and bare act search |

---

## 2.2 Project Structure

```
legaldesk/
├── client/                        ← React frontend (Vite)
│   ├── public/
│   └── src/
│       ├── assets/                ← Images, icons, Spline scenes
│       ├── components/
│       │   ├── shared/            ← Reusable: Button, Badge, Modal, Sidebar, Navbar
│       │   ├── admin/             ← Admin-specific composite components
│       │   ├── lawyer/            ← Lawyer-specific composite components
│       │   └── client/            ← Client-specific composite components
│       ├── pages/
│       │   ├── auth/              ← Login, Register
│       │   ├── admin/             ← AdminDashboard, Cases, Staff, Billing
│       │   ├── lawyer/            ← LawyerDashboard, CaseDetail, AI, Calendar, News
│       │   └── client/            ← ClientDashboard, MyCases, Appointments
│       ├── hooks/                 ← Custom hooks: useAuth, useCases, useDocuments
│       ├── store/                 ← Redux: authSlice, caseSlice, documentSlice, etc.
│       ├── services/              ← Axios API service functions
│       ├── i18n/                  ← en.json, mr.json translation files
│       ├── utils/                 ← Date helpers, status color maps, formatters
│       └── App.jsx
│
└── server/                        ← Node.js + Express backend
    ├── config/                    ← db.js, cloudinary.js, nodemailer.js
    ├── models/                    ← All Mongoose schemas (see Document 5)
    ├── routes/                    ← auth.routes, case.routes, document.routes, etc.
    ├── controllers/               ← Logic separated from routes
    ├── middleware/                 ← verifyToken.js, checkRole.js, checkCaseAccess.js
    ├── services/                  ← claudeService.js, emailService.js, pdfService.js
    ├── jobs/                      ← hearingReminder.cron.js
    └── server.js
```

---

## 2.3 API Architecture

All API routes follow REST conventions:

```
/api/auth         → login, register, logout, refresh
/api/admin        → firm stats, user management (Admin only)
/api/cases        → CRUD (creation: Admin only; read: role-filtered)
/api/documents    → upload, list, delete, share-with-client
/api/ai           → analyze document, chat (Lawyer only)
/api/hearings     → CRUD per case
/api/appointments → book, confirm, cancel
/api/expenses     → log, list, delete
/api/invoices     → generate, list, mark-paid, export-pdf
/api/search       → Indian Kanoon proxy, save judgement to case
/api/news         → Fetched and cached legal news
/api/notifications → list, mark-read
```

---

## 2.4 Performance Requirements

- Admin dashboard: loads under 2 seconds with 100+ cases (use pagination + lean queries)
- AI analysis: begins streaming within 5 seconds of document upload
- Email reminders: cron job runs daily at 8:00 AM IST
- Cloudinary uploads: direct upload from backend, return secure URL

---

## 2.5 Environment Variables Required

```
# Server
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# Email
EMAIL_USER=
EMAIL_PASS=

# Indian Kanoon
INDIAN_KANOON_API_KEY=
```

---

# DOCUMENT 3 — APP FLOW DOCUMENT

## 3.1 Authentication Flow (All Roles)

```
User visits /login
    ↓
Enters email + password
    ↓
POST /api/auth/login
    ↓
Server validates → Returns JWT access token + refresh token (httpOnly cookie)
    ↓
Redux stores user: { id, name, role, language }
    ↓
React Router checks role →
    admin    → /admin/dashboard
    lawyer   → /lawyer/dashboard
    client   → /client/dashboard
```

Client self-registers at `/register`:
```
Fill form → POST /api/auth/register → Account created (role: client)
→ Redirect to /login
```

---

## 3.2 Admin Flow

```
/admin/dashboard
├── Stat cards: Total Active Cases | Closed This Month | Total Revenue | Pending Invoices
├── Lawyer Workload bar chart (cases per lawyer)
├── Case Status Summary (Active/Urgent/Hearing Soon counts)
└── Recent Cases table

/admin/cases
├── All cases table (search + filter by status, lawyer, type)
├── [Create Case] button →
│   Modal: Title, Case Type, Client (dropdown of all clients),
│   Assign Lawyers (multi-select), First Hearing Date, Description
│   → POST /api/cases → case created with LD-YYYY-XXXX number
└── Click case row → /admin/cases/:id (read-only detail view)

/admin/clients
├── All clients table
└── [Add Client] button → Create client account (name, email, phone, password)

/admin/staff
├── All lawyers table (name, active cases, cases resolved, revenue generated)
└── [Add Lawyer] button → Create lawyer account (name, email, phone, bar council number, specialization, hourly rate)

/admin/billing
├── All invoices table (case, client, amount, status: Paid/Pending/Overdue)
└── Click invoice → Invoice detail (mark as paid)
```

---

## 3.3 Lawyer Flow

```
/lawyer/dashboard
├── LEFT PANEL: Today's Schedule
│   ├── Hearings today (case name, court, time)
│   └── Pre-argument notes for each today's hearing
├── MAIN: Case Cards (color-coded by status)
│   ├── Filter: All / Active / Urgent / Hearing Soon
│   └── Search by case name or client
└── QUICK STATS: Total assigned | Upcoming this week | Pending documents

/lawyer/cases/:id  ← Case Detail Page (most important page)
├── TAB 1: Overview
│   ├── Case info: type, status (editable), client, lawyers, court
│   ├── Hearing timeline (chronological list of all past + future hearings)
│   └── [Add Hearing] → modal: date, time, court, type, pre-argument notes
├── TAB 2: Documents
│   ├── All uploaded docs (name, type, date, shared-with-client toggle)
│   ├── [Upload Document] → Cloudinary upload
│   ├── Each doc: [View] [Delete / Archive] [Share with Client toggle]
│   └── Document Pending badge if flagged
├── TAB 3: AI Analysis
│   ├── List of all previously analyzed documents (permanent record)
│   ├── [Analyze New Document] → select from uploaded docs or upload fresh
│   │   → Claude API → streaming results:
│   │       Summary | Risk Flags | Key Parties | Key Dates | Obligations
│   └── Chat Interface (case-specific, remembers history)
│       → All chat messages stored in AIAnalysis.chatHistory for this case
├── TAB 4: Expenses & Billing
│   ├── Logged expenses list (type, description, amount, date)
│   ├── [Log Expense] → modal: type (billable hours / court fees / travel / other), amount, hours
│   ├── Auto-calculated totals
│   └── [Generate Invoice] → creates invoice → [Export PDF]
├── TAB 5: Appointments
│   ├── All appointments for this case
│   └── Confirm / Cancel pending appointments
└── TAB 6: Saved Judgements
    ├── All judgements pinned to this case
    └── [Go to Search] → /lawyer/search

/lawyer/calendar
├── Full monthly calendar view
├── Color-coded events: Red (this week), Yellow (next week), Green (later)
└── Click date → list of hearings/deadlines for that day

/lawyer/ai
└── Standalone AI Document Analyzer (not tied to specific case)
    → Same flow as Case Detail Tab 3 but general-purpose

/lawyer/search
├── Search bar → Indian Kanoon API proxy
├── Results list (title, citation, court, date, snippet)
├── Click result → Full summary (AI-summarized)
└── [Save to Case] → pin to selected case

/lawyer/news
├── News cards filtered by category
├── Categories: Supreme Court | High Court | Legislation | All
└── Click → opens full article

/lawyer/appointments
└── All appointments across all cases
    (same data as Case Detail Tab 5 but aggregated)
```

---

## 3.4 Client Flow

```
/client/dashboard
├── HERO: Active Case Card
│   ├── Case name, type, status (color-coded badge)
│   ├── Next Hearing: date + countdown ("In 3 days")
│   └── Message/Note from Lawyer (latest note marked as shared)
└── Quick links: My Cases | Book Appointment | My Documents

/client/cases
├── All their cases (list)
└── Click case → /client/cases/:id
    ├── Status badge (color-coded)
    ├── Timeline: chronological events (hearings, actions)
    ├── Assigned Lawyers (names only)
    └── Next Hearing date

/client/documents
└── All documents shared by lawyer across all their cases
    [View] [Download] only — no upload, no delete

/client/appointments
├── [Book Appointment] →
│   Select lawyer → Select case → Pick date/time slot → Submit
│   → Status: Pending (lawyer must confirm)
└── All appointments list with status badges

/client/notifications
└── All notifications:
    Hearing reminders | New document shared | Appointment status changes
```

---

## 3.5 Key Cross-Role Flows

### Hearing Reminder Flow
```
node-cron runs daily at 8:00 AM IST
    ↓
Query: all hearings where date = today+7, today+3, today+1
AND reminder not yet sent for that interval
    ↓
For each hearing → send email to the CASE'S CLIENT (not lawyer)
    ↓
Mark hearing.reminders.sent7day / sent3day / sent1day = true
    ↓
Create notification record for client
```

### Document Analysis Flow
```
Lawyer uploads PDF/DOCX → Cloudinary → Document record created
    ↓
Lawyer clicks [Analyze] on document
    ↓
Backend: fetch file from Cloudinary URL, extract text
    ↓
POST to Claude API with system prompt + extracted text
    ↓
Stream response back to frontend
    ↓
On completion: save to AIAnalysis document attached to case
(summary, riskFlags, keyParties, keyDates, obligations)
    ↓
Chat interface opens — lawyer asks questions
    ↓
Each message + response appended to AIAnalysis.chatHistory
```

---

# DOCUMENT 4 — UI/UX DESIGN BRIEF

## 4.1 Design Philosophy

**"Premium Legal Intelligence"**

The design makes the platform feel alive and modern without sacrificing the trust and
credibility that legal professionals demand. It sits at the intersection of:
- Premium fintech (data clarity, professional typography, purposeful color)
- Subtle spatial depth (3D accent on entry, micro-animations throughout)
- Legal authority (clean, structured, nothing frivolous)

The goal: when a lawyer opens this app, they feel like they are using something
that is more sophisticated than anything else they have tried — but it never
distracts from the work.

---

## 4.2 The 3D Strategy (High Reward, Controlled Risk)

**Where 3D is used (and where it is not):**

| Area | Approach |
|---|---|
| Login page | Embedded Spline 3D scene — abstract scales of justice / geometric legal motif. This is the WOW moment. |
| Dashboard stat cards | Subtle hover lift with Framer Motion (translateZ effect via box-shadow + scale) |
| Page transitions | Framer Motion AnimatePresence — smooth slide-in/fade between pages |
| Number counters | Animated count-up on dashboard stats (framer-motion useMotionValue) |
| Sidebar collapse | Spring animation — feels physical |
| Status badge changes | Animated color crossfade |
| Card hover states | Lift + shadow deepening |

**Where 3D is NOT used:**
- Inside case detail pages — these are work areas. Clean, fast, no distraction.
- Tables and data grids — data must be readable, not dancing
- The AI chat interface — purely functional

The 3D is the *entry experience* and the *micro-feedback*. Not the main stage.

---

## 4.3 Color System

```
Backgrounds:
  Page background:      #F8FAFC   ← Almost white, slight cool tint
  Card / Surface:       #FFFFFF   ← Pure white cards
  Card border:          #E2E8F0   ← Subtle slate border

Sidebar:
  Sidebar background:   #1E293B   ← Deep navy
  Sidebar text active:  #FFFFFF
  Sidebar text default: #94A3B8
  Sidebar hover bg:     #334155
  Sidebar active bg:    #1D4ED8   ← Primary blue highlight

Primary Action:
  Primary:              #1D4ED8
  Primary hover:        #1E40AF
  Primary light bg:     #EFF6FF   ← For subtle backgrounds

Case Status Colors:
  Active:               #3B82F6   ← Blue
  Urgent:               #EF4444   ← Red
  Hearing Soon:         #F59E0B   ← Amber/Yellow
  Completed:            #22C55E   ← Green
  Closed:               #6B7280   ← Gray

Text:
  Primary text:         #0F172A
  Secondary text:       #64748B
  Muted text:           #94A3B8

Semantic:
  Success:              #22C55E
  Warning:              #F59E0B
  Error:                #EF4444
  Info:                 #3B82F6
```

---

## 4.4 Typography

```
Primary font:      Inter (Google Fonts)
  Weights used:    400, 500, 600, 700
Mono font:         JetBrains Mono (case numbers: LD-2024-0001)

Scale:
  Page title:      24px / 700
  Section title:   18px / 600
  Card title:      16px / 600
  Body:            14px / 400
  Small / Caption: 12px / 400
  Sidebar label:   13px / 500
```

---

## 4.5 Layout System

```
Sidebar:        240px (expanded) → 64px (collapsed, icon only)
Top Navbar:     64px height (fixed)
Content Area:   Full remaining width, max-width 1400px, centered
Gutter:         24px page padding
Card padding:   20px
Grid:           12-column with 16px gap
```

---

## 4.6 Key Component Specs

**Case Status Badge:**
- Pill shape, colored background at 15% opacity, colored text, colored left border
- Example: Active → blue background, blue text, blue left border

**Sidebar Navigation Item:**
- Icon (20px, Lucide React) + label + active indicator (left blue bar + bg highlight)
- Collapsed state: icon only, tooltip on hover

**Stat Card (Dashboard):**
- White card, 1px border, subtle shadow
- Large number (32px/700), label below (13px/400), icon top-right
- Hover: lifts 4px with deeper shadow (Framer Motion)

**Document Pending Badge:**
- Persistent red dot on case card + "Documents Pending" chip in case detail header

**AI Analysis Result Card:**
- Summary section with left blue border
- Risk Flags: each flag as an expandable row (red/yellow/green severity icon)
- Key Parties: blue chips
- Key Dates: timeline dots

---

## 4.7 Animation Tokens (Framer Motion)

```javascript
// Page transition
initial: { opacity: 0, x: 20 }
animate: { opacity: 1, x: 0 }
transition: { duration: 0.25, ease: 'easeOut' }

// Card hover
whileHover: { y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }
transition: { type: 'spring', stiffness: 400, damping: 25 }

// Sidebar collapse
width: sidebarOpen ? 240 : 64
transition: { type: 'spring', stiffness: 300, damping: 30 }

// Number counter
// Use framer-motion useMotionValue + animate on mount
```

---

## 4.8 Unique Design Moments

These are the moments that make this site feel different from every generic legal SaaS:

1. **Login page 3D scene** — Spline-embedded abstract legal visual. Smooth camera parallax on mouse move.
2. **Dashboard stat card count-up** — Numbers animate from 0 to value on first load.
3. **Case status transition** — When admin changes a case status, the badge color crossfades with a smooth animation.
4. **AI analysis streaming** — Text streams in token by token (like ChatGPT). Creates a sense of intelligence working.
5. **Sidebar collapse spring** — The sidebar snaps with a physical spring feel.
6. **Hearing countdown chip** — On the client dashboard, "Next Hearing in 3 days" pulses softly when ≤ 3 days away.

---

# DOCUMENT 5 — BACKEND SCHEMA

## 5.1 User Schema

```
Collection: users

Fields:
  _id           ObjectId
  name          String, required
  email         String, required, unique, lowercase
  password      String, required, bcrypt hashed (never returned in API)
  role          Enum: ['admin', 'lawyer', 'client'], required
  phone         String
  profilePicture String (Cloudinary URL)
  language      Enum: ['en', 'mr'], default: 'en'
  isActive      Boolean, default: true

  // Lawyer-only fields
  barCouncilNumber  String
  specialization    String (e.g. 'Criminal', 'Civil', 'Family')
  hourlyRate        Number (in INR)

  // Client-only fields
  address           String
  aadharLast4       String

  createdAt     Date (auto)
  updatedAt     Date (auto)
```

---

## 5.2 Case Schema

```
Collection: cases

Fields:
  _id           ObjectId
  caseNumber    String, unique (auto-generated: LD-YYYY-XXXX)
  title         String, required
  description   String
  caseType      Enum: ['civil', 'criminal', 'family', 'property', 'corporate', 'other']
  status        Enum: ['active', 'urgent', 'hearing_soon', 'completed', 'closed']
               default: 'active'

  client        ObjectId → ref: User (role: client), required
  lawyers       [ObjectId] → ref: User (role: lawyer), at least 1 required
  createdBy     ObjectId → ref: User (role: admin)

  court         String
  judge         String
  filingDate    Date

  nextHearing   Date (denormalized for quick access — updated when new hearing added)

  documentsPending  Boolean, default: false

  notes         String (lawyer's general case notes — visible only to lawyers)

  // References to sub-collections
  // Documents, Hearings, Appointments, AIAnalysis, Expenses, Invoice
  // are separate collections with case reference — NOT embedded
  // This keeps the case document lean

  createdAt     Date (auto)
  updatedAt     Date (auto)
```

---

## 5.3 Hearing Schema

```
Collection: hearings

Fields:
  _id         ObjectId
  case        ObjectId → ref: Case, required
  date        Date, required
  time        String (e.g. '10:30 AM')
  court       String
  courtRoom   String
  judge       String
  type        Enum: ['hearing', 'filing', 'arguments', 'judgment', 'mention', 'other']
  preArgumentNotes  String  ← shown on lawyer dashboard the day of the hearing
  outcome     String  ← filled after hearing is done
  reminders:
    sent7day  Boolean, default: false
    sent3day  Boolean, default: false
    sent1day  Boolean, default: false

  createdBy   ObjectId → ref: User
  createdAt   Date (auto)
```

---

## 5.4 Document Schema

```
Collection: documents

Fields:
  _id             ObjectId
  name            String, required
  description     String
  case            ObjectId → ref: Case, required
  uploadedBy      ObjectId → ref: User

  cloudinaryUrl       String, required
  cloudinaryPublicId  String, required
  fileType        Enum: ['pdf', 'docx', 'image', 'other']
  fileSize        Number (bytes)

  isSharedWithClient  Boolean, default: false
  ← Only shared docs appear in Client's document view

  isDeleted       Boolean, default: false  ← soft delete
  deletedAt       Date
  deletedBy       ObjectId → ref: User

  versions: [{
    url           String
    publicId      String
    uploadedAt    Date
    uploadedBy    ObjectId → ref: User
  }]

  createdAt       Date (auto)
  updatedAt       Date (auto)
```

---

## 5.5 AI Analysis Schema

```
Collection: aianalyses

Fields:
  _id         ObjectId
  case        ObjectId → ref: Case, required, unique
  ← ONE AIAnalysis document per case. All analyses and chat live here.

  analyses: [{
    document      ObjectId → ref: Document
    analyzedAt    Date
    analyzedBy    ObjectId → ref: User

    summary       String
    riskFlags: [{
      clause      String
      risk        String
      severity    Enum: ['high', 'medium', 'low']
    }]
    keyParties    [String]
    keyDates: [{
      date        String
      description String
    }]
    obligations   [String]
  }]

  chatHistory: [{
    role          Enum: ['user', 'assistant']
    content       String
    timestamp     Date, default: Date.now
  }]
  ← This is the full case-specific chat memory.
  ← Sent to Claude API as conversation history on each new message.

  updatedAt     Date (auto)
```

---

## 5.6 Appointment Schema

```
Collection: appointments

Fields:
  _id           ObjectId
  case          ObjectId → ref: Case
  client        ObjectId → ref: User
  lawyer        ObjectId → ref: User

  requestedDate Date, required
  confirmedDate Date

  status        Enum: ['pending', 'confirmed', 'completed', 'cancelled']
               default: 'pending'

  notes         String (client's reason for booking)
  reminderSent  Boolean, default: false

  createdAt     Date (auto)
  updatedAt     Date (auto)
```

---

## 5.7 Expense Schema

```
Collection: expenses

Fields:
  _id         ObjectId
  case        ObjectId → ref: Case, required
  loggedBy    ObjectId → ref: User (lawyer)

  type        Enum: ['billable_hours', 'court_fees', 'travel', 'filing', 'other']
  description String
  amount      Number, required (in INR)
  hours       Number ← only if type === 'billable_hours'
  date        Date, required

  createdAt   Date (auto)
```

---

## 5.8 Invoice Schema

```
Collection: invoices

Fields:
  _id           ObjectId
  invoiceNumber String, unique (auto: INV-YYYY-XXXX)
  case          ObjectId → ref: Case
  client        ObjectId → ref: User

  expenses      [ObjectId] → ref: Expense ← all expenses included in this invoice

  subtotal      Number
  taxRate       Number, default: 18 (GST %)
  taxAmount     Number
  total         Number

  status        Enum: ['pending', 'paid', 'overdue'], default: 'pending'
  dueDate       Date
  paidAt        Date

  pdfUrl        String ← Cloudinary URL of generated PDF

  createdAt     Date (auto)
  updatedAt     Date (auto)
```

---

## 5.9 Notification Schema

```
Collection: notifications

Fields:
  _id       ObjectId
  user      ObjectId → ref: User
  type      Enum: [
              'hearing_reminder',
              'document_uploaded',
              'document_shared',
              'appointment_confirmed',
              'appointment_cancelled',
              'case_status_changed',
              'document_pending'
            ]
  title     String
  message   String
  case      ObjectId → ref: Case (optional)

  isRead    Boolean, default: false
  readAt    Date

  createdAt Date (auto)
```

---

## 5.10 Saved Judgement Schema

```
Collection: savedjudgements

Fields:
  _id         ObjectId
  case        ObjectId → ref: Case
  savedBy     ObjectId → ref: User

  title       String
  citation    String (e.g. 'AIR 2021 SC 1234')
  court       String
  judgmentDate String
  summary     String ← AI-generated plain English summary
  kanoonUrl   String ← Original Indian Kanoon URL

  tags        [String]

  createdAt   Date (auto)
```

---

# DOCUMENT 6 — IMPLEMENTATION PLAN

## 6.1 Overview

Duration: 4 weeks (aggressive but achievable solo)
Philosophy: Get a working skeleton early. Add features vertically (one complete feature
at a time, front-to-back) rather than horizontally (all frontend first, then all backend).

---

## 6.2 Week 1 — Foundation (The Skeleton)

**Goal:** Everything is connected. All 3 roles can log in and see their correct empty dashboard.

**Backend tasks:**
- Project setup: Express server, MongoDB connection, folder structure
- All Mongoose schemas created (all 10 collections)
- Auth routes: register, login, logout, refresh token
- JWT middleware: verifyToken, checkRole
- User CRUD for Admin (create lawyer, create client, list users)
- Seed file: create 1 admin, 2 lawyers, 3 clients, 5 sample cases

**Frontend tasks:**
- React + Vite + Tailwind + Shadcn/ui setup
- Design tokens configured (colors, fonts)
- Login page built (with Spline 3D scene integrated)
- Protected route component (role-based redirect)
- Sidebar component (collapsible, role-aware navigation items)
- Admin dashboard shell (stat cards — empty/mock data)
- Lawyer dashboard shell
- Client dashboard shell
- i18n setup (react-i18next with en.json and mr.json stubs)

**End of Week 1 checkpoint:** Log in as each role → land on correct dashboard. Sidebar collapses. Language toggle switches language.

---

## 6.3 Week 2 — Case Management Core

**Goal:** Admin can create and manage cases. Lawyer can view and work on cases. Full case detail page complete.

**Backend tasks:**
- Case CRUD routes (Admin-only creation)
- Case list routes (filtered by role — lawyers see assigned only, clients see their own only)
- Hearing CRUD (add/edit/delete hearings to a case)
- Document upload route (Cloudinary integration)
- Document list, delete (soft + hard), share-with-client toggle
- Case status update route
- nextHearing auto-update logic when hearings are modified
- documentsPending flag logic

**Frontend tasks:**
- Admin: Cases page (table, search, filter, Create Case modal)
- Admin: Staff Management page
- Admin: Clients page
- Lawyer: Case cards (color-coded, filter tabs)
- Case Detail Page (all 6 tabs — fully functional):
  - Tab 1: Overview + Hearing timeline + Add Hearing modal
  - Tab 2: Document Vault (upload, list, share toggle, delete)
  - Tab 3: AI Analysis (shell — no Claude yet)
  - Tab 4: Expenses + Invoice (shell)
  - Tab 5: Appointments
  - Tab 6: Saved Judgements (shell)
- Lawyer: Calendar view (react-big-calendar or FullCalendar)
- Client: Case view (read-only timeline + shared documents)

**End of Week 2 checkpoint:** Admin creates a case → assigns to lawyer → lawyer sees it color-coded → lawyer adds hearing + uploads document → client can see shared document.

---

## 6.4 Week 3 — AI + Automation

**Goal:** The features that make LegalDesk actually impressive are live.

**Backend tasks:**
- Claude API integration: document text extraction + analysis endpoint (streaming)
- AIAnalysis model: create on first analysis, append on subsequent
- Chat endpoint: builds full chatHistory array → sends to Claude → appends response
- Indian Kanoon API proxy route
- Save judgement to case route
- AI-summarize judgement route
- Nodemailer email service setup
- node-cron job: daily 8am IST, scan for upcoming hearings, send reminder emails to clients
- Notification creation on key events (hearing reminder, doc shared, appointment update)

**Frontend tasks:**
- AI Analyzer UI: upload → streaming analysis → structured result cards
- Chat interface: message bubbles, send on Enter, auto-scroll, loading indicator
- Legal Search page: search bar + results + save-to-case
- Legal News Feed: categorized news cards (fetched + cached)
- Notification bell + dropdown (unread count badge)
- Client dashboard: hearing countdown chip with pulse animation

**End of Week 3 checkpoint:** Lawyer uploads a contract → AI analyzes it in streaming → results show with risk flags → lawyer asks follow-up question → AI responds using previous context.

---

## 6.5 Week 4 — Billing, Polish, and Deployment

**Goal:** Ship a complete, polished product.

**Backend tasks:**
- Expense CRUD
- Invoice generation (compute totals, GST)
- Puppeteer PDF generation (invoice template → PDF → upload to Cloudinary → return URL)
- Digital signature save endpoint (base64 signature image stored)
- Appointment booking + confirm/cancel routes
- Admin billing overview route

**Frontend tasks:**
- Expense logger (modal, form, list)
- Invoice UI (generate button, preview, PDF download)
- Digital signature modal (signature_pad canvas integration)
- Appointment booking flow (client)
- Admin billing dashboard
- react-i18next: fill all mr.json Marathi translations
- Animation polish pass: Framer Motion on all pages, loading skeletons everywhere
- Responsive CSS cleanup (mobile-friendly secondary pass)
- ENV setup for production, deploy: Vercel (frontend) + Render (backend)

**End of Week 4 checkpoint:** Full demo — log in as Admin → create case → log in as Lawyer → analyze document, chat with it, add hearing, generate invoice → log in as Client → see case status, hearing countdown, download shared document, book appointment.

---

# DOCUMENT 7 — SECURITY AND ACCESS CONTROL DOCUMENT

## 7.1 Authentication System

**Token Strategy:**
```
Access Token:
  - Duration: 15 minutes
  - Payload: { userId, role }
  - Stored: Memory (Redux state) — NOT localStorage

Refresh Token:
  - Duration: 7 days
  - Stored: httpOnly cookie (not accessible via JavaScript)
  - Rotated on every use (new refresh token issued each time)

Token Rotation:
  - Axios interceptor catches 401 → calls /api/auth/refresh → retries original request
```

**Why httpOnly cookies for refresh token:**
- localStorage is vulnerable to XSS attacks
- httpOnly cookie cannot be read by JavaScript — only sent automatically by browser

---

## 7.2 Role-Based Access Control Matrix

| Route / Resource | Admin | Lawyer | Client |
|---|---|---|---|
| Create Case | ✅ | ❌ | ❌ |
| View All Cases | ✅ | ❌ (assigned only) | ❌ (own only) |
| Update Case Status | ✅ | ✅ (assigned only) | ❌ |
| Create Lawyer Account | ✅ | ❌ | ❌ |
| Create Client Account | ✅ | ❌ | Self-register |
| Upload Document | ✅ | ✅ (assigned cases) | ❌ |
| View Documents | ✅ | ✅ (assigned cases) | ✅ (shared only) |
| Delete Document | ❌ | ✅ | ❌ |
| AI Document Analysis | ❌ | ✅ | ❌ |
| View AI Results | ❌ | ✅ | ❌ |
| Billing / Invoices | ✅ (read all) | ✅ (own cases) | ❌ |
| Legal Search | ❌ | ✅ | ❌ |
| Book Appointment | ❌ | ❌ | ✅ |
| Confirm Appointment | ❌ | ✅ | ❌ |
| View Notifications | Self | Self | Self |

**Key Rules:**
1. Admin CANNOT access AI analysis results (by design — privacy)
2. A Lawyer can ONLY read/write data for cases where their ID is in the lawyers[] array
3. A Client can ONLY see cases where their ID is the client field
4. Shared documents: only documents where isSharedWithClient === true are served to clients

---

## 7.3 Middleware Stack

Every protected API call goes through this chain in order:

```
Request → verifyToken → checkRole → checkCaseAccess → Controller

verifyToken.js:
  - Extract Bearer token from Authorization header
  - Verify with JWT_SECRET
  - Attach decoded { userId, role } to req.user
  - If invalid/expired → 401 Unauthorized

checkRole(allowedRoles):
  - Higher-order middleware: checkRole(['admin', 'lawyer'])
  - If req.user.role not in allowedRoles → 403 Forbidden

checkCaseAccess.js:
  - For any route with :caseId param
  - Admin → always allowed through
  - Lawyer → fetch case, check if req.user.id in case.lawyers → else 403
  - Client → fetch case, check if req.user.id === case.client → else 403
```

---

## 7.4 File Storage Security

- All files stored on Cloudinary with **private delivery** — not publicly accessible by default
- Backend generates **signed URLs** with 1-hour expiry for each document view/download request
- Client cannot access a Cloudinary URL directly — must request through authenticated API
- Document deletion: soft-deleted records (isDeleted: true) are not served via API but the Cloudinary file is retained for audit. Hard delete removes both.

---

## 7.5 Input Validation & Injection Prevention

- All request bodies validated using **express-validator** before hitting controllers
- Mongoose schemas enforce types — prevents NoSQL injection through type coercion
- **helmet.js** sets secure HTTP headers on all responses
- **cors** configured with whitelist: only CLIENT_URL allowed as origin
- **express-rate-limit** on auth routes: max 10 login attempts per 15 minutes per IP
- File uploads: MIME type checked before sending to Cloudinary (only pdf, docx, image allowed)

---

## 7.6 Security Headers (via helmet.js)

```
Content-Security-Policy: configured
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: enabled in production
```

---

## 7.7 Environment Security Rules

- `.env` is in `.gitignore` — never committed to repository
- Different JWT secrets for access and refresh tokens
- Cloudinary API secret never exposed to frontend
- Claude API key only ever used server-side — never sent to browser
- All secrets rotated before deployment to production

---

*End of LegalDesk Master Blueprint v1.0*
*Update this document before changing any feature, schema, or design decision.*
