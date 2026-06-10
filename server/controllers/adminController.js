const bcrypt = require('bcryptjs');
const User = require('../models/User.model');

const createLawyer = async (req, res, next) => {
  try {
    const { name, email, password, phone, barCouncilNumber, specialization, hourlyRate } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newLawyerData = {
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'lawyer'
    };
    
    if (barCouncilNumber !== undefined) newLawyerData.barCouncilNumber = barCouncilNumber;
    if (specialization !== undefined) newLawyerData.specialization = specialization;
    if (hourlyRate !== undefined) newLawyerData.hourlyRate = hourlyRate;

    const newLawyer = await User.create(newLawyerData);

    res.status(201).json({
      success: true,
      message: 'Lawyer account created successfully',
      user: {
        id: newLawyer._id,
        name: newLawyer.name,
        email: newLawyer.email,
        role: newLawyer.role,
        phone: newLawyer.phone,
        barCouncilNumber: newLawyer.barCouncilNumber,
        specialization: newLawyer.specialization,
        hourlyRate: newLawyer.hourlyRate,
        createdAt: newLawyer.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

const getLawyers = async (req, res, next) => {
  try {
    const lawyers = await User.find({ role: 'lawyer' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: lawyers.length, lawyers });
  } catch (err) {
    next(err);
  }
};

const getClients = async (req, res, next) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: clients.length, clients });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLawyer, getLawyers, getClients };
