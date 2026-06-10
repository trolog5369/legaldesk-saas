const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Notification = require('../models/Notification.model');

// GET / — List notifications for the authenticated user
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: req.user.userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /:id/read — Mark a single notification as read (ownership check)
router.patch('/:id/read', verifyToken, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
