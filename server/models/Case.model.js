'use strict';

const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  caseNumber: { type: String, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  caseType: {
    type: String,
    enum: ['civil', 'criminal', 'family', 'property', 'corporate', 'other'],
  },
  status: {
    type: String,
    enum: ['active', 'urgent', 'hearing_soon', 'completed', 'closed'],
    default: 'active',
  },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lawyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  court: { type: String },
  judge: { type: String },
  filingDate: { type: Date },
  nextHearing: { type: Date },
  documentsPending: { type: Boolean, default: false },
  notes: { type: String },
}, {
  timestamps: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// Pre-save hook: auto-generate sequential caseNumber on first save
// ─────────────────────────────────────────────────────────────────────────────
CaseSchema.pre('save', async function () {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      caseNumber: new RegExp(`^LD-${year}-`),
    });
    this.caseNumber = `LD-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Compound Indexes (Sweep 2D)
// ─────────────────────────────────────────────────────────────────────────────

// The `lawyers` field is an array of ObjectIds — MongoDB automatically creates
// a multikey index here. Combined with status, this accelerates the lawyer
// dashboard query: all cases where the logged-in lawyer's ID is in the lawyers
// array, optionally filtered by status.
CaseSchema.index({ lawyers: 1, status: 1 });

// Accelerates client portal queries: all cases belonging to a specific client.
CaseSchema.index({ client: 1 });

// Accelerates admin dashboard status grouping and the cron job that scans
// for upcoming hearing dates.
CaseSchema.index({ status: 1, nextHearing: 1 });

module.exports = mongoose.model('Case', CaseSchema);
