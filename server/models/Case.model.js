const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  caseNumber: { type: String, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  caseType: { type: String, enum: ['civil', 'criminal', 'family', 'property', 'corporate', 'other'] },
  status: { type: String, enum: ['active', 'urgent', 'hearing_soon', 'completed', 'closed'], default: 'active' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lawyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  court: { type: String },
  judge: { type: String },
  filingDate: { type: Date },
  nextHearing: { type: Date },
  documentsPending: { type: Boolean, default: false },
  notes: { type: String },
}, { timestamps: true });

CaseSchema.pre('save', async function () {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      caseNumber: new RegExp(`^LD-${year}-`)
    });
    this.caseNumber = `LD-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Case', CaseSchema);
