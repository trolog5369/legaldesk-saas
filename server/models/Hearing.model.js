const mongoose = require('mongoose');

const HearingSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  date: { type: Date, required: true },
  time: { type: String },
  court: { type: String },
  courtRoom: { type: String },
  judge: { type: String },
  type: { type: String, enum: ['hearing', 'filing', 'arguments', 'judgment', 'mention', 'other'] },
  preArgumentNotes: { type: String },
  outcome: { type: String },
  reminders: {
    sent7day: { type: Boolean, default: false },
    sent3day: { type: Boolean, default: false },
    sent1day: { type: Boolean, default: false },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Hearing', HearingSchema);
