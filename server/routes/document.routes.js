const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const { uploadDocument } = require('../controllers/documentController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/documents/upload — Upload a document (Admin, Lawyer only)
router.post(
  '/upload',
  verifyToken,
  checkRole(['admin', 'lawyer']),
  upload.single('document'),
  uploadDocument
);

module.exports = router;
