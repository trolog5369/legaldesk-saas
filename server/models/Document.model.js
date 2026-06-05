const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cloudinaryUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx', 'image', 'other'] },
  fileSize: { type: Number },
  isSharedWithClient: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  versions: [{
    url: { type: String },
    publicId: { type: String },
    uploadedAt: { type: Date },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('CaseDocument', DocumentSchema);
