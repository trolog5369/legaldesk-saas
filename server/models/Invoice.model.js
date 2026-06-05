const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
  subtotal: { type: Number },
  taxRate: { type: Number, default: 18 },
  taxAmount: { type: Number },
  total: { type: Number },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  dueDate: { type: Date },
  paidAt: { type: Date },
  pdfUrl: { type: String },
}, { timestamps: true });

InvoiceSchema.pre('save', async function () {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      invoiceNumber: new RegExp(`^INV-${year}-`)
    });
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
