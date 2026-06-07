const express = require('express');
const router = express.Router();
const protect = require('../middleware/verifyToken');
const Appointment = require('../models/Appointment.model');

// Route 1 — POST /
router.post('/', protect, async (req, res) => {
  try {
    const { lawyerId, clientId, caseId, title, description, start, end, type } = req.body;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid start or end date format." });
    }

    const conflict = await Appointment.findOne({
      lawyerId,
      status: 'scheduled',
      start: { $lt: endDate },
      end: { $gt: startDate }
    });

    if (conflict) {
      return res.status(400).json({ message: "Time slot conflicts with an existing appointment." });
    }

    const newAppointment = new Appointment({
      lawyerId,
      clientId,
      caseId,
      title,
      description,
      start: startDate,
      end: endDate,
      type
    });

    const savedAppointment = await newAppointment.save();
    return res.status(201).json(savedAppointment);

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Route 2 — GET /
router.get('/', protect, async (req, res) => {
  try {
    const role = req.user.role;
    let query = {};

    if (role === 'lawyer') {
      query = { lawyerId: req.user.userId };
    } else if (role === 'client') {
      query = { clientId: req.user.userId };
    }

    const appointments = await Appointment.find(query)
      .populate('lawyerId', 'name email')
      .populate('clientId', 'name email phone')
      .populate({
        path: 'caseId',
        select: 'title caseNumber',
        match: { _id: { $exists: true } } // Mongoose handles null caseId automatically
      })
      .sort({ start: 1 });

    return res.status(200).json(appointments);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Route 3 — PUT /:id
router.put('/:id', protect, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.user.role === 'client') {
      return res.status(403).json({ message: 'Not authorized to update appointment' });
    }

    if (req.user.role !== 'admin' && appointment.lawyerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update appointment' });
    }

    const { start, end, status } = req.body;
    const isStatusClosing = status === 'cancelled' || status === 'completed';

    if ((start || end) && !isStatusClosing) {
      const startDate = start ? new Date(start) : appointment.start;
      const endDate = end ? new Date(end) : appointment.end;

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid start or end date format." });
      }

      const conflict = await Appointment.findOne({
        _id: { $ne: appointmentId },
        lawyerId: appointment.lawyerId,
        status: 'scheduled',
        start: { $lt: endDate },
        end: { $gt: startDate }
      });

      if (conflict) {
        return res.status(400).json({ message: "Updated time slot conflicts with an existing appointment." });
      }
    }

    Object.assign(appointment, req.body);
    const updatedAppointment = await appointment.save();

    return res.status(200).json(updatedAppointment);

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
