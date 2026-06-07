const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const Case = require('../models/Case.model');
const Document = require('../models/Document.model');
const AIAnalysis = require('../models/AIAnalysis.model');
const { analyzeDocument } = require('../services/claudeService');

// POST /analyze — Analyze a document with Claude AI
router.post('/analyze', verifyToken, checkRole(['lawyer']), async (req, res) => {
  try {
    // Step 1 — Input Validation (fail fast)
    if (!req.body.caseId) {
      return res.status(400).json({ message: 'caseId is required.' });
    }
    if (!req.body.documentId) {
      return res.status(400).json({ message: 'documentId is required.' });
    }

    // Step 2 — Case Existence & Lawyer Assignment Guard
    const foundCase = await Case.findById(req.body.caseId);
    if (!foundCase) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    const isAssigned = foundCase.lawyers
      .map((id) => id.toString())
      .includes(req.user.userId.toString());
    if (!isAssigned) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this case.' });
    }

    // Step 3 — Document Retrieval
    const foundDocument = await Document.findById(req.body.documentId);
    if (!foundDocument) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    if (foundDocument.case.toString() !== req.body.caseId) {
      return res.status(400).json({ message: 'Document does not belong to this case.' });
    }

    // Step 4 — Text Extraction
    // TODO: Week 3 Day 2 — replace with real Cloudinary text extraction
    const extractedText = `Document: ${foundDocument.name}. Source: ${foundDocument.cloudinaryUrl}. Please analyze this legal document based on its title and available metadata.`;

    // Step 5 — Claude Analysis
    let analysisResult;
    try {
      analysisResult = await analyzeDocument(extractedText);
    } catch (error) {
      return res.status(502).json({ message: 'AI analysis failed.', error: error.message });
    }

    // Step 6 — Persist to AIAnalysis (Upsert)
    const analysisEntry = {
      document: req.body.documentId,
      analyzedBy: req.user.userId,
      analyzedAt: new Date(),
      summary: analysisResult.summary,
      riskFlags: analysisResult.riskFlags,
      keyParties: analysisResult.keyParties,
      keyDates: analysisResult.keyDates,
      obligations: analysisResult.obligations,
    };

    const result = await AIAnalysis.findOneAndUpdate(
      { case: req.body.caseId },
      {
        $push: { analyses: analysisEntry },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, new: true }
    );

    // Step 7 — Response
    return res.status(200).json({
      message: 'Analysis complete.',
      analysis: analysisEntry,
      aiAnalysisId: result._id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});

module.exports = router;
