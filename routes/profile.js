const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { authenticateToken, authorizeUser } = require('../middleware/auth');
const profileController = require("../controllers/profileController");

// Upload avatar
router.post("/upload", profileController.uploadAvatar);

// Fetch predefined avatars (no auth required)
router.get("/avatars", profileController.getAvatars);

// Profile routes (require auth)
router.get('/:userId', authenticateToken, authorizeUser, getProfile);
router.put('/:userId', authenticateToken, authorizeUser, updateProfile);


module.exports = router;
