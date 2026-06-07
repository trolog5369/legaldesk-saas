const mongoose = require('mongoose');

const riskFlagSchema = new mongoose.Schema({
  clause: { type: String, required: true },
  risk: { type: String, required: true },
  severity: { type: String, enum: ['high', 'medium', 'low'], required: true },
}, { _id: false });

const keyDateSchema = new mongoose.Schema({
  date: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false });

const analysisEntrySchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseDocument' },
  analyzedAt: { type: Date, default: Date.now },
  analyzedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  summary: { type: String },
  riskFlags: [riskFlagSchema],
  keyParties: [{ type: String }],
  keyDates: [keyDateSchema],
  obligations: [{ type: String }],
});

const chatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const AIAnalysisSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, unique: true },
  analyses: { type: [analysisEntrySchema], default: [] },
  chatHistory: { type: [chatMessageSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('AIAnalysis', AIAnalysisSchema, 'aianalyses');
