'use strict';

/**
 * Centralized Express error handling middleware.
 * Must be registered as the LAST app.use() in server.js.
 *
 * @param {Error}    err  - The error object propagated via next(err)
 * @param {Object}   req  - Express request
 * @param {Object}   res  - Express response
 * @param {Function} next - Express next (required for 4-arg signature)
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // ── Internal Logging ────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    // Development: full stack trace so engineers can debug immediately
    console.error('[ERROR]', err.stack);
  } else {
    // Production: message only — never leak stack traces to logs or clients
    console.error('[ERROR]', err.message);
  }

  // ── Status Code Resolution ───────────────────────────────────────────────
  let statusCode = err.status || err.statusCode;

  if (!statusCode) {
    if (err.message && err.message.includes('CORS policy violation')) {
      statusCode = 403;
    } else {
      statusCode = 500;
    }
  }

  // ── Response Message Sanitization ───────────────────────────────────────
  // In production, 5xx errors must NEVER expose raw database errors,
  // Mongoose validation messages, or Puppeteer/internal traces to the client.
  let message = err.message || 'An unexpected error occurred.';

  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    message = 'An internal server error occurred. Please try again.';
  }

  // ── JSON Response ────────────────────────────────────────────────────────
  return res.status(statusCode).json({
    success: false,
    message,
    code: statusCode,
  });
};

module.exports = errorHandler;
