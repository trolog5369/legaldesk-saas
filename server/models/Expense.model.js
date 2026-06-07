'use strict';

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true,
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['billable_hours', 'court_fees', 'travel', 'filing', 'other'],
    required: true,
  },
  amount: {
    type: Number,
  },
  hoursLogged: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// Compound Indexes (Sweep 2A)
// ─────────────────────────────────────────────────────────────────────────────

// Accelerates the primary query: fetch all expenses for a case sorted by newest first.
// This is the exact query pattern executed on every Tab 4 (Billing) load in CaseDetail.
expenseSchema.index({ caseId: 1, date: -1 });

// Accelerates admin billing overview queries that group or aggregate expenses by lawyer.
expenseSchema.index({ lawyerId: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
