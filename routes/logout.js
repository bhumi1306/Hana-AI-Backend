// routes/authRoutes.js
const express = require('express');
const { authenticateToken, authorizeUser } = require('../middleware/auth');
const { logoutUser } = require('../controllers/logoutController');

const router = express.Router();

// logout requires both token + userId param
router.post('/logout/:userId', authenticateToken, authorizeUser, logoutUser);

module.exports = router;
