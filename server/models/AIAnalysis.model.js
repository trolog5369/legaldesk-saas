const mongoose = require('mongoose');

const AIAnalysisSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, unique: true },

  analyses: [{
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseDocument' },
    analyzedAt: { type: Date },
    analyzedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    summary: { type: String },
    riskFlags: [{
      clause: { type: String },
      risk: { type: String },
      severity: { type: String, enum: ['high', 'medium', 'low'] },
    }],
    keyParties: [{ type: String }],
    keyDates: [{
      date: { type: String },
      description: { type: String },
    }],
    obligations: [{ type: String }],
  }],

  chatHistory: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('AIAnalysis', AIAnalysisSchema);
