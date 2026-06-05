const Case = require('../models/Case.model');

const checkCaseAccess = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({ success: false, message: 'Case ID is required' });
    }

    const caseDoc = await Case.findById(caseId).select('client lawyers');

    if (!caseDoc) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const { role, userId } = req.user;

    if (role === 'admin') {
      req.caseDoc = caseDoc;
      return next();
    }

    if (role === 'lawyer') {
      const isAssigned = caseDoc.lawyers.some(
        (lawyerId) => lawyerId.toString() === userId.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Access denied to this case' });
      }
      req.caseDoc = caseDoc;
      return next();
    }

    if (role === 'client') {
      if (caseDoc.client.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this case' });
      }
      req.caseDoc = caseDoc;
      return next();
    }

    return res.status(403).json({ success: false, message: 'Access denied to this case' });
  } catch (err) {
    next(err);
  }
};

module.exports = checkCaseAccess;
