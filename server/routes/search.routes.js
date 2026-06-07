const express = require('express');
const axios = require('axios');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const checkCaseAccess = require('../middleware/checkCaseAccess');
const SavedJudgement = require('../models/SavedJudgement.model');
const { chatWithDocument } = require('../services/claudeService');

// ROUTE A — GET /
// Proxy search to Indian Kanoon API
router.get(
  '/',
  verifyToken,
  checkRole(['lawyer']),
  async (req, res) => {
    try {
      const { q, page } = req.query;

      if (!q || !q.trim()) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const response = await axios.post(
        'https://api.indiankanoon.org/search/',
        null,
        {
          params: { formInput: q, pagenum: page || 0 },
          headers: { Authorization: 'Token ' + process.env.INDIAN_KANOON_API_KEY },
        }
      );

      return res.status(200).json(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.warn('[Kanoon Proxy] External API auth failure — check INDIAN_KANOON_API_KEY');
      } else {
        console.error('Indian Kanoon search proxy error:', err.message);
      }
      return res.status(502).json({ message: 'Legal search service temporarily unavailable' });
    }
  }
);

// ROUTE B — POST /save
// Pin a judgment to a case with AI-generated summary
router.post(
  '/save',
  verifyToken,
  checkRole(['lawyer']),
  // Bridge middleware: checkCaseAccess reads from req.params.caseId,
  // but this route receives caseId in the body. Copy it to params.
  (req, res, next) => {
    req.params.caseId = req.body.caseId;
    next();
  },
  checkCaseAccess,
  async (req, res) => {
    try {
      const { caseId, title, citation, court, judgmentDate, kanoonUrl, tags, rawText } = req.body;

      if (!caseId || !title) {
        return res.status(400).json({ message: 'caseId and title are required' });
      }

      // Duplicate check
      if (kanoonUrl) {
        const existing = await SavedJudgement.findOne({ case: caseId, kanoonUrl });
        if (existing) {
          return res.status(409).json({ message: 'Judgment already pinned to this case' });
        }
      }

      // Generate AI summary via Claude
      let summary = 'Summary generation failed. Review judgment manually.';
      try {
        const userContent = rawText || (title + (citation ? ' — ' + citation : ''));
        const systemPrompt = 'You are a legal research assistant. Produce a concise 3–5 sentence plain-English summary of the following court judgment suitable for a lawyer\'s quick reference. Focus on the key facts, the legal issue, and the court\'s decision.';
        // Use chatWithDocument with an empty history and the summary request
        const aiResponse = await chatWithDocument(
          [{ role: 'user', content: systemPrompt + '\n\nJudgment text:\n' + userContent }],
          'Please provide the summary now.'
        );
        if (aiResponse && aiResponse.trim()) {
          summary = aiResponse.trim();
        }
      } catch (claudeErr) {
        console.error('Claude summary generation failed:', claudeErr.message);
        // Proceed with fallback summary — pin operation still succeeds
      }

      const savedJudgement = await SavedJudgement.create({
        case: caseId,
        savedBy: req.user.userId,
        title,
        citation: citation || '',
        court: court || '',
        judgmentDate: judgmentDate || '',
        summary,
        kanoonUrl: kanoonUrl || '',
        tags: tags || [],
      });

      return res.status(201).json(savedJudgement);
    } catch (err) {
      console.error('Save judgment error:', err.message);
      return res.status(500).json({ message: 'Failed to save judgment' });
    }
  }
);

module.exports = router;
