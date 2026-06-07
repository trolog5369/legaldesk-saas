const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expenses: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense'
    }],
    required: true,
    validate: [v => Array.isArray(v) && v.length > 0, 'Must have at least one expense']
  },
  subtotal: {
    type: Number,
    required: true
  },
  taxRate: {
    type: Number,
    default: 18
  },
  taxAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  pdfUrl: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

invoiceSchema.pre('validate', async function (next) {
  if (this.isNew) {
    if (!this.dueDate) {
      this.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }
    
    if (!this.invoiceNumber) {
      const currentYear = new Date().getFullYear().toString();
      const lastInvoice = await this.constructor.findOne({
        invoiceNumber: new RegExp('^INV-' + currentYear)
      }).sort({ invoiceNumber: -1 });
      
      let nextNumber = 1;
      if (lastInvoice && lastInvoice.invoiceNumber) {
        const parts = lastInvoice.invoiceNumber.split('-');
        if (parts.length === 3) {
          nextNumber = parseInt(parts[2], 10) + 1;
        }
      }
      
      this.invoiceNumber = `INV-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
    }
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
