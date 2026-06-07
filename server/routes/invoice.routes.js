const express = require('express');
const router = express.Router();
const protect = require('../middleware/verifyToken');
const Invoice = require('../models/Invoice.model');
const Expense = require('../models/Expense.model');
const Case = require('../models/Case.model');
const User = require('../models/User.model');
const puppeteer = require('puppeteer');
const cloudinary = require('../config/cloudinary');
const transporter = require('../config/nodemailer');

router.post('/generate', protect, async (req, res) => {
  let publicIdToCleanup = null;
  try {
    const { caseId, clientId, expenseIds } = req.body;

    if (!caseId || !clientId || !expenseIds || expenseIds.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or expenses.' });
    }

    // A. Data validation and enrichment
    const caseDoc = await Case.findById(caseId).select('title caseNumber court');
    const client = await User.findById(clientId).select('name email phone address');
    const expenses = await Expense.find({ _id: { $in: expenseIds } });

    if (!caseDoc || !client) {
      return res.status(400).json({ message: 'Case or Client not found.' });
    }

    if (expenses.length !== expenseIds.length) {
      return res.status(400).json({ message: 'One or more expense IDs are invalid.' });
    }

    const existingInvoice = await Invoice.findOne({ expenses: { $in: expenseIds } });
    if (existingInvoice) {
      return res.status(400).json({ message: 'One or more selected expenses are already included in a previous invoice.' });
    }

    // B. Financial calculation
    const subtotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const taxRate = 18;
    const taxAmount = Math.round((subtotal * taxRate) / 100 * 100) / 100;
    const totalAmount = subtotal + taxAmount;

    // C. Build the invoice HTML template
    let expensesRowsHtml = '';
    expenses.forEach((exp, index) => {
      const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      const dateStr = new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      expensesRowsHtml += `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 13px;">${dateStr}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 13px;">${exp.description}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 13px;">${exp.type}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 13px; text-align: right;">₹ ${exp.amount.toFixed(2)}</td>
        </tr>
      `;
    });

    const dueDateStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const currentDateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const htmlString = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div>
            <div style="font-size: 28px; font-weight: bold; color: #1E293B;">LegalDesk</div>
            <div style="font-size: 14px; color: #64748B;">Professional Legal Services</div>
          </div>
          <div style="text-align: right; font-size: 13px;">
            <div style="font-size: 16px; font-weight: bold; color: #0F172A; margin-bottom: 4px;">Invoice</div>
            <div>Invoice No: <strong>Pending...</strong></div>
            <div>Date: ${currentDateStr}</div>
            <div>Due Date: ${dueDateStr}</div>
          </div>
        </div>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin-bottom: 20px;" />
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px;">
          <div style="width: 48%;">
            <div style="font-weight: bold; color: #0F172A; margin-bottom: 4px;">Billed To:</div>
            <div>${client.name}</div>
            <div>${client.email}</div>
            <div>${client.phone || ''}</div>
            <div style="white-space: pre-wrap;">${client.address || ''}</div>
          </div>
          <div style="width: 48%;">
            <div style="font-weight: bold; color: #0F172A; margin-bottom: 4px;">Case Information:</div>
            <div><strong>${caseDoc.caseNumber}</strong></div>
            <div>${caseDoc.title}</div>
            <div>${caseDoc.court || ''}</div>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #F8FAFC;">
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #E2E8F0; font-size: 13px; color: #64748B;">Date</th>
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #E2E8F0; font-size: 13px; color: #64748B;">Description</th>
              <th style="text-align: left; padding: 10px; border-bottom: 2px solid #E2E8F0; font-size: 13px; color: #64748B;">Type</th>
              <th style="text-align: right; padding: 10px; border-bottom: 2px solid #E2E8F0; font-size: 13px; color: #64748B;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${expensesRowsHtml}
          </tbody>
        </table>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px; font-size: 14px;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span>Subtotal</span>
              <span>₹ ${subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
              <span>GST @ 18%</span>
              <span>₹ ${taxAmount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: bold; color: #0F172A;">
              <span>Total</span>
              <span>₹ ${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div style="font-size: 12px; color: #94A3B8; font-style: italic; margin-bottom: 8px; text-align: center;">
          Please arrange payment within 14 days. For queries, contact your assigned advocate.
        </div>
        <div style="font-size: 12px; color: #94A3B8; text-align: center;">
          This is a computer-generated invoice and does not require a signature.
        </div>
      </body>
      </html>
    `;

    // D. Generate PDF using Puppeteer
    let pdfBuffer;
    let browser;
    try {
      browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(htmlString, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    // E. Upload PDF to Cloudinary
    const tempPublicId = 'invoice_TEMP_' + Date.now();
    publicIdToCleanup = 'legaldesk/invoices/' + tempPublicId;
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'legaldesk/invoices', public_id: tempPublicId },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(pdfBuffer);
    });

    let pdfUrl = uploadResult.secure_url;

    // F. Save the Invoice document
    const invoice = new Invoice({
      caseId,
      clientId,
      expenses: expenseIds,
      subtotal,
      taxAmount,
      totalAmount
    });

    let savedInvoice = await invoice.save();
    
    // Update Cloudinary with resolved invoiceNumber
    const newPublicId = 'legaldesk/invoices/invoice_' + savedInvoice.invoiceNumber;
    try {
      const renameResult = await cloudinary.uploader.rename(uploadResult.public_id, newPublicId, { resource_type: 'raw' });
      pdfUrl = renameResult.secure_url;
      publicIdToCleanup = newPublicId; // if something fails later, delete this
    } catch (renameErr) {
      console.warn("Cloudinary rename failed, keeping temp URL:", renameErr);
    }

    savedInvoice.pdfUrl = pdfUrl;
    await savedInvoice.save();

    // G. Send the email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `Invoice ${savedInvoice.invoiceNumber} — ${caseDoc.title}`,
      html: `
        <p>Dear ${client.name},</p>
        <p>Please find attached your invoice <strong>${savedInvoice.invoiceNumber}</strong> for the case <em>${caseDoc.title}</em>.</p>
        <p><strong>Total Amount Due:</strong> ₹ ${totalAmount.toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${dueDateStr}</p>
        <p>If you have any questions, please contact your assigned advocate.</p>
        <p>Best regards,<br>LegalDesk</p>
      `,
      attachments: [
        {
          filename: `invoice_${savedInvoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    publicIdToCleanup = null; // Success, don't cleanup

    // H. Respond
    return res.status(201).json(savedInvoice);

  } catch (error) {
    console.error(error);
    if (publicIdToCleanup) {
      cloudinary.uploader.destroy(publicIdToCleanup, { resource_type: 'raw' }).catch(e => console.error('Cloudinary cleanup failed', e));
    }
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

router.get('/case/:caseId', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({ caseId: req.params.caseId })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    return res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/download', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    if (!invoice.pdfUrl) {
      return res.status(400).json({ message: 'PDF has not been generated for this invoice.' });
    }

    const publicId = 'legaldesk/invoices/invoice_' + invoice.invoiceNumber;
    const signedUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
      resource_type: 'raw',
      expires_at: Math.floor(Date.now() / 1000) + 3600
    });
    // Wait, since it was uploaded as 'raw' without an extension suffix in the public_id sometimes, or maybe we didn't specify 'pdf'.
    // Actually `cloudinary.url` is often safer for signing raw files. Let's use it.
    // The requirement says: Using your Cloudinary SDK, generate a signed URL...
    // The simplest Cloudinary signed URL method for raw assets:
    const url = cloudinary.url(publicId, {
      resource_type: 'raw',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600
    });

    return res.status(200).json({ signedUrl: url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    if (!['pending', 'paid', 'overdue'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = status;
    if (status === 'paid') {
      invoice.paidAt = new Date();
    }
    await invoice.save();

    return res.status(200).json(invoice);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
