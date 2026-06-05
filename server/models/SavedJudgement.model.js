const mongoose = require('mongoose');

const SavedJudgementSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String },
  citation: { type: String },
  court: { type: String },
  judgmentDate: { type: String },
  summary: { type: String },
  kanoonUrl: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('SavedJudgement', SavedJudgementSchema);
