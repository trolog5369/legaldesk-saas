const mongoose = require('mongoose');

const savedJudgementSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  citation: { type: String, trim: true },
  court: { type: String, trim: true },
  judgmentDate: { type: String, trim: true },
  summary: { type: String },
  kanoonUrl: { type: String, trim: true },
  tags: { type: [String], default: [] },
}, { timestamps: true, collection: 'savedjudgements' });

savedJudgementSchema.index({ case: 1, savedBy: 1 });

module.exports = mongoose.model('SavedJudgement', savedJudgementSchema);
