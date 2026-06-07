'use strict';

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  // unique: true on email automatically creates a MongoDB unique index
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'lawyer', 'client'], required: true },
  phone: { type: String },
  profilePicture: { type: String },
  language: { type: String, enum: ['en', 'mr'], default: 'en' },
  isActive: { type: Boolean, default: true },

  // Lawyer-specific fields
  barCouncilNumber: { type: String },
  specialization: { type: String },
  hourlyRate: { type: Number },

  // Client-specific fields
  address: { type: String },
  aadharLast4: { type: String },
}, {
  timestamps: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// Indexes (Sweep 2E)
// Note: email already has a unique index via `unique: true` in the schema field
// definition — MongoDB creates this automatically. No explicit index call needed.
// ─────────────────────────────────────────────────────────────────────────────

// Accelerates the admin staff management query (all active lawyers) and the
// admin client management query (all active clients).
UserSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('User', UserSchema);
