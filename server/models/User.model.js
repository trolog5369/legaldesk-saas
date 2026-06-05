const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'lawyer', 'client'], required: true },
  phone: { type: String },
  profilePicture: { type: String },
  language: { type: String, enum: ['en', 'mr'], default: 'en' },
  isActive: { type: Boolean, default: true },

  barCouncilNumber: { type: String },
  specialization: { type: String },
  hourlyRate: { type: Number },

  address: { type: String },
  aadharLast4: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
