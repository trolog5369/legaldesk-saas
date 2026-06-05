const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const { createLawyer, getLawyers, getClients } = require('../controllers/adminController');

router.post('/lawyers', verifyToken, checkRole(['admin']), createLawyer);
router.get('/lawyers', verifyToken, checkRole(['admin']), getLawyers);
router.get('/clients', verifyToken, checkRole(['admin']), getClients);

module.exports = router;
