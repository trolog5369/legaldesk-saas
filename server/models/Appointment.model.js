const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return this.start && v > this.start;
      },
      message: 'End time must be after start time.'
    }
  },
  type: {
    type: String,
    enum: ['court_appearance', 'client_meeting', 'document_review', 'other'],
    default: 'client_meeting'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
