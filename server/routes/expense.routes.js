const express = require('express');
const router = express.Router();
const protect = require('../middleware/verifyToken');
const Expense = require('../models/Expense.model');
const User = require('../models/User.model');

// Route 1 — POST /
router.post('/', protect, async (req, res) => {
  try {
    const lawyerId = req.user.userId;
    const { type, hoursLogged, description, date, amount: reqAmount, caseId } = req.body;

    let amount = undefined;

    if (type === 'billable_hours') {
      const user = await User.findById(lawyerId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const hourlyRate = user.hourlyRate;
      if (hourlyRate === undefined || hourlyRate === 0) {
        return res.status(400).json({ message: "Lawyer hourly rate is not configured. Contact admin." });
      }
      
      amount = hourlyRate * parseFloat(hoursLogged);
    } else {
      amount = parseFloat(reqAmount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Amount is required for this expense type." });
      }
    }

    const expense = new Expense({
      caseId,
      lawyerId,
      type,
      amount,
      hoursLogged: type === 'billable_hours' ? parseFloat(hoursLogged) : undefined,
      description,
      date: date || Date.now()
    });

    const savedExpense = await expense.save();
    return res.status(201).json(savedExpense);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Route 2 — GET /case/:caseId
router.get('/case/:caseId', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ caseId: req.params.caseId })
      .sort({ date: -1 })
      .populate('lawyerId', 'name');
      
    return res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Route 3 — DELETE /:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (req.user.role === 'admin' || req.user.userId === expense.lawyerId.toString()) {
      await Expense.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: 'Expense deleted.' });
    } else {
      return res.status(403).json({ message: "Not authorized to delete this expense." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
