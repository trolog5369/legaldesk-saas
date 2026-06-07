const cloudinary = require('../config/cloudinary');
const Case = require('../models/Case.model');
const Document = require('../models/Document.model');

/**
 * @desc    Upload a document to Cloudinary and persist metadata to MongoDB
 * @route   POST /api/documents/upload
 * @access  Admin, Lawyer
 */
const uploadDocument = async (req, res) => {
  try {
    // ── Step 1: Input Validation ────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    if (!req.body.caseId) {
      return res.status(400).json({ message: 'caseId is required.' });
    }

    // ── Step 2: Case Existence Guard ────────────────────────────
    const existingCase = await Case.findById(req.body.caseId);
    if (!existingCase) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    // ── Step 3: Cloudinary Upload via Promise-Wrapped Stream ────
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'legaldesk/documents' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // ── Step 4: fileType Derivation ─────────────────────────────
    let fileType = 'other';
    const mime = req.file.mimetype;

    if (mime === 'application/pdf') {
      fileType = 'pdf';
    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword'
    ) {
      fileType = 'docx';
    } else if (mime.startsWith('image/')) {
      fileType = 'image';
    }

    // ── Step 5: Persist to MongoDB ──────────────────────────────
    const docData = {
      name: req.file.originalname,
      case: req.body.caseId,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      fileType,
      fileSize: req.file.size,
      uploadedBy: req.user.userId,
      isSharedWithClient: false,
      isDeleted: false,
    };

    if (req.body.description) {
      docData.description = req.body.description;
    }

    const savedDocument = await Document.create(docData);

    // ── Step 6: Response ────────────────────────────────────────
    return res.status(201).json({
      message: 'Document uploaded successfully.',
      document: savedDocument,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Upload failed.',
      error: error.message,
    });
  }
};

module.exports = { uploadDocument };
