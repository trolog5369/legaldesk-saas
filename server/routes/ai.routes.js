const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const Case = require('../models/Case.model');
const Document = require('../models/Document.model');
const AIAnalysis = require('../models/AIAnalysis.model');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /analyze — SSE streaming document analysis with Claude AI
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

    // ── SSE Header Block ───────────────────────────────────────────────
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // ── Token Accumulator ──────────────────────────────────────────────
    let fullResponse = '';

    // ── Claude Streaming Invocation ────────────────────────────────────
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: `You are an expert Indian legal document analyst. Analyze the provided legal document and return your response as strict JSON only. Do not include any prose, markdown fences, preamble, or explanation — output only valid JSON. The JSON object must contain exactly these top-level keys:
- "summary" (string): A concise summary of the document.
- "riskFlags" (array of objects): Each object must have "clause" (string), "risk" (string), and "severity" (string, one of "high", "medium", or "low").
- "keyParties" (array of strings): Names of all key parties involved.
- "keyDates" (array of objects): Each object must have "date" (string) and "description" (string).
- "obligations" (array of strings): Key obligations identified in the document.`,
      messages: [{ role: 'user', content: extractedText }],
    });

    // ── Stream Event: Token ────────────────────────────────────────────
    stream.on('text', (chunk) => {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    });

    // ── Stream Event: Completion ───────────────────────────────────────
    stream.on('finalMessage', async () => {
      // Parse the complete accumulated response
      let parsed;
      try {
        parsed = JSON.parse(fullResponse);
      } catch (parseErr) {
        res.write(`data: ${JSON.stringify({ error: 'Failed to parse AI response.' })}\n\n`);
        res.end();
        return;
      }

      // Build analysis entry
      const analysisEntry = {
        document: req.body.documentId,
        analyzedBy: req.user.userId,
        analyzedAt: new Date(),
        summary: parsed.summary,
        riskFlags: parsed.riskFlags,
        keyParties: parsed.keyParties,
        keyDates: parsed.keyDates,
        obligations: parsed.obligations,
      };

      // Upsert to MongoDB
      try {
        await AIAnalysis.findOneAndUpdate(
          { case: req.body.caseId },
          {
            $push: { analyses: analysisEntry },
            $set: { updatedAt: new Date() },
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        res.write(`data: ${JSON.stringify({ error: 'Failed to save analysis to database.' })}\n\n`);
        res.end();
        return;
      }

      // Send close signal with the persisted entry
      res.write(`data: ${JSON.stringify({ done: true, analysisEntry })}\n\n`);
      res.end();
    });

    // ── Stream Event: Error ────────────────────────────────────────────
    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });
  } catch (error) {
    // If SSE headers haven't been sent yet, respond with JSON error
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
