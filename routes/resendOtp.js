const express = require('express');
const router = express.Router();
const otpController = require('../controllers/resendOtpController');

router.post('/resend-otp', otpController.resendOTP);

module.exports = router;
