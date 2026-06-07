'use strict';

const express = require('express');
const router = express.Router();
const protect = require('../middleware/verifyToken');
const Expense = require('../models/Expense.model');
const User = require('../models/User.model');

// ─────────────────────────────────────────────────────────────────────────────
// POST / — Log a new expense (lawyer only)
// Supports billable_hours (auto-calculates from hourlyRate) and fixed amounts.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res, next) => {
  try {
    const lawyerId = req.user.userId;
    const { type, hoursLogged, description, date, amount: reqAmount, caseId } = req.body;

    let amount;

    if (type === 'billable_hours') {
      const user = await User.findById(lawyerId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const hourlyRate = user.hourlyRate;
      if (hourlyRate === undefined || hourlyRate === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lawyer hourly rate is not configured. Contact admin.',
        });
      }

      amount = hourlyRate * parseFloat(hoursLogged);
    } else {
      amount = parseFloat(reqAmount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount is required for this expense type.',
        });
      }
    }

    const expense = new Expense({
      caseId,
      lawyerId,
      type,
      amount,
      hoursLogged: type === 'billable_hours' ? parseFloat(hoursLogged) : undefined,
      description,
      date: date || Date.now(),
    });

    const savedExpense = await expense.save();
    return res.status(201).json(savedExpense);

  } catch (error) {
    return next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /case/:caseId — Retrieve all expenses for a specific case, newest first
// ─────────────────────────────────────────────────────────────────────────────
router.get('/case/:caseId', protect, async (req, res, next) => {
  try {
    const expenses = await Expense.find({ caseId: req.params.caseId })
      .sort({ date: -1 })
      .populate('lawyerId', 'name');

    return res.status(200).json(expenses);
  } catch (error) {
    return next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /:id — Delete an expense (admin or owning lawyer only)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (req.user.role === 'admin' || req.user.userId === expense.lawyerId.toString()) {
      await Expense.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true, message: 'Expense deleted.' });
    }

    return res.status(403).json({ success: false, message: 'Not authorized to delete this expense.' });

  } catch (error) {
    return next(error);
  }
});

module.exports = router;
