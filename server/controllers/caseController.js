const Case = require('../models/Case.model');

const VALID_CASE_TYPES = ['civil', 'criminal', 'family', 'property', 'corporate', 'other'];

/**
 * @desc    Create a new case (admin-only, defense-in-depth check)
 * @route   POST /api/cases
 * @access  Admin
 */
const createCase = async (req, res, next) => {
  try {
    // Defense-in-depth role guard
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: only admins can create cases' });
    }

    const { title, description, caseType, client, lawyers, court, judge, filingDate, nextHearing } = req.body;

    // ── Validation ──────────────────────────────────────────
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required and must be a non-empty string' });
    }

    if (!caseType || !VALID_CASE_TYPES.includes(caseType)) {
      return res.status(400).json({ success: false, message: `caseType is required and must be one of: ${VALID_CASE_TYPES.join(', ')}` });
    }

    if (!client || typeof client !== 'string' || client.trim() === '') {
      return res.status(400).json({ success: false, message: 'Client is required and must be a non-empty string (ObjectId)' });
    }

    if (!lawyers || !Array.isArray(lawyers) || lawyers.length < 1) {
      return res.status(400).json({ success: false, message: 'Lawyers is required and must be a non-empty array with at least 1 element' });
    }

    // ── caseNumber Generation ───────────────────────────────
    // NOTE: In a production system, an atomic counter (e.g. findOneAndUpdate on a
    // Counters collection) should be used to eliminate race condition risk. The
    // current year-scoped countDocuments + padStart approach is sufficient for
    // this build phase.
    const year = new Date().getFullYear();
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const count = await Case.countDocuments({ createdAt: { $gte: startOfYear } });
    const paddedCounter = (count + 1).toString().padStart(4, '0');
    const caseNumber = `LD-${year}-${paddedCounter}`;

    // ── Build Case Document ─────────────────────────────────
    const newCase = new Case({
      caseNumber,
      title: title.trim(),
      description,
      caseType,
      client,
      lawyers,
      court,
      judge,
      filingDate,
      nextHearing,
      createdBy: req.user.userId,
      status: 'active',
    });

    await newCase.save();

    // Populate refs before returning
    const populatedCase = await Case.findById(newCase._id)
      .populate('client', 'name email role')
      .populate('lawyers', 'name email role');

    return res.status(201).json({ success: true, data: populatedCase });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get cases (role-branching query: admin=all, lawyer=own, client=own)
 * @route   GET /api/cases
 * @access  Admin, Lawyer, Client
 */
const getCases = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'admin') {
      query = {};
    } else if (req.user.role === 'lawyer') {
      query = { lawyers: req.user.userId };
    } else if (req.user.role === 'client') {
      query = { client: req.user.userId };
    } else {
      return res.status(403).json({ success: false, message: 'Forbidden: unrecognized role' });
    }

    const cases = await Case.find(query)
      .populate('client', 'name email role')
      .populate('lawyers', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: cases.length, data: cases });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCase, getCases };
