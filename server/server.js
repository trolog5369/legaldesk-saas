require('dotenv').config();

// ─────────────────────────────────────────────────────────────────────────────
// 1D — STARTUP ENVIRONMENT GUARD
// Must run before mongoose.connect() and before any middleware registration.
// ─────────────────────────────────────────────────────────────────────────────
const REQUIRED_ENV_VARS = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ANTHROPIC_API_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
];

const missingVars = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(
    '[FATAL] Server cannot start. The following required environment variables are missing or empty:\n' +
      missingVars.map((v) => `  - ${v}`).join('\n') +
      '\nPlease populate your .env file and restart.'
  );
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Imports
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ─────────────────────────────────────────────────────────────────────────────
// 1A — Dynamic CORS Origin Configuration
// ─────────────────────────────────────────────────────────────────────────────
let allowedOrigins;
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
} else {
  console.warn('[WARN] ALLOWED_ORIGINS not set in environment. Falling back to localhost only.');
  allowedOrigins = ['http://localhost:5173'];
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests (no Origin header)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy violation: origin not permitted'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400,
};

// ─────────────────────────────────────────────────────────────────────────────
// Database + Cron Initialization
// ─────────────────────────────────────────────────────────────────────────────
connectDB().then(() => {
  const { startHearingReminderCron } = require('./jobs/hearingReminder.cron');
  startHearingReminderCron();
  console.log('[CRON] Hearing reminder scheduler initialized — 08:00 IST daily');
});

// ─────────────────────────────────────────────────────────────────────────────
// Express App
// ─────────────────────────────────────────────────────────────────────────────
const app = express();

// ── Middleware Chain ────────────────────────────────────────────────────────
// helmet() MUST be the absolute first middleware — before CORS and everything else.
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

// ─────────────────────────────────────────────────────────────────────────────
// Route Registration
// ─────────────────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const caseRoutes = require('./routes/case.routes');
const documentRoutes = require('./routes/document.routes');
const aiRoutes = require('./routes/ai.routes');
const searchRoutes = require('./routes/search.routes');
const notificationRoutes = require('./routes/notification.routes');
const expenseRoutes = require('./routes/expense.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const appointmentRoutes = require('./routes/appointment.routes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/appointments', appointmentRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// 1B — Centralized Error Handler
// MUST be the absolute LAST app.use() call — after all routes.
// ─────────────────────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Server Startup
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
