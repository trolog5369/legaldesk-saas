const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['billable_hours', 'court_fees', 'travel', 'filing', 'other'] },
  description: { type: String },
  amount: { type: Number, required: true },
  hours: { type: Number },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('Expense', ExpenseSchema);
