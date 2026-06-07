'use strict';

const express = require('express');
const router = express.Router();
const protect = require('../middleware/verifyToken');
const Appointment = require('../models/Appointment.model');

// ─────────────────────────────────────────────────────────────────────────────
// POST / — Book a new appointment with collision detection
// Checks for overlapping scheduled appointments for the same lawyer before saving.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res, next) => {
  try {
    const { lawyerId, clientId, caseId, title, description, start, end, type } = req.body;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date format.' });
    }

    // Collision detection: compound index on (lawyerId, status, start) makes this fast
    const conflict = await Appointment.findOne({
      lawyerId,
      status: 'scheduled',
      start: { $lt: endDate },
      end: { $gt: startDate },
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Time slot conflicts with an existing appointment.',
      });
    }

    const newAppointment = new Appointment({
      lawyerId,
      clientId,
      caseId,
      title,
      description,
      start: startDate,
      end: endDate,
      type,
    });

    const savedAppointment = await newAppointment.save();
    return res.status(201).json(savedAppointment);

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message).join(', ');
      return res.status(400).json({ success: false, message: messages });
    }
    return next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET / — Retrieve appointments (role-filtered)
// Admin: all appointments. Lawyer: own appointments. Client: own appointments.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    const role = req.user.role;
    let query = {};

    if (role === 'lawyer') {
      query = { lawyerId: req.user.userId };
    } else if (role === 'client') {
      query = { clientId: req.user.userId };
    }
    // admin: no query filter — fetches all

    const appointments = await Appointment.find(query)
      .populate('lawyerId', 'name email')
      .populate('clientId', 'name email phone')
      .populate({
        path: 'caseId',
        select: 'title caseNumber',
        match: { _id: { $exists: true } },
      })
      .sort({ start: 1 });

    return res.status(200).json(appointments);

  } catch (error) {
    return next(error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /:id — Update an existing appointment (lawyer or admin only)
// Re-runs collision detection if dates are being changed.
// Clients are not permitted to modify appointments.
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', protect, async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'client') {
      return res.status(403).json({ success: false, message: 'Not authorized to update appointment' });
    }

    if (req.user.role !== 'admin' && appointment.lawyerId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update appointment' });
    }

    const { start, end, status } = req.body;
    const isStatusClosing = status === 'cancelled' || status === 'completed';

    if ((start || end) && !isStatusClosing) {
      const startDate = start ? new Date(start) : appointment.start;
      const endDate = end ? new Date(end) : appointment.end;

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid start or end date format.' });
      }

      // Collision detection: exclude current appointment from the conflict check
      const conflict = await Appointment.findOne({
        _id: { $ne: appointmentId },
        lawyerId: appointment.lawyerId,
        status: 'scheduled',
        start: { $lt: endDate },
        end: { $gt: startDate },
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Updated time slot conflicts with an existing appointment.',
        });
      }
    }

    Object.assign(appointment, req.body);
    const updatedAppointment = await appointment.save();

    return res.status(200).json(updatedAppointment);

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message).join(', ');
      return res.status(400).json({ success: false, message: messages });
    }
    return next(error);
  }
});

module.exports = router;
