const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedDate: { type: Date, required: true },
  confirmedDate: { type: Date },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
