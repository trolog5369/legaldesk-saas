const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: [
    'hearing_reminder',
    'document_uploaded',
    'document_shared',
    'appointment_confirmed',
    'appointment_cancelled',
    'case_status_changed',
    'document_pending',
  ]},
  title: { type: String },
  message: { type: String },
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('Notification', NotificationSchema);
