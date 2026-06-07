const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const checkCaseAccess = require('../middleware/checkCaseAccess');
const { createCase, getCases } = require('../controllers/caseController');

// POST /api/cases — Create a new case (admin only)
router.post('/', verifyToken, checkRole(['admin']), createCase);

// GET /api/cases — Fetch cases (role-filtered inside controller)
router.get('/', verifyToken, checkRole(['admin', 'lawyer', 'client']), getCases);

module.exports = router;
