// controllers/otpController.js
const pool = require('../db');
const generateOTP = require('../utils/generateOTP');
const sendOTPEmail = require('../utils/emailService');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyOTP = async (req, res) => {
    // ... your existing verifyOTP code
};

//  New resendOTP API
exports.resendOTP = async (req, res) => {
    const { email } = req.body;

    console.log("[RESEND] Incoming request:", { email });

    if (!email) {
        console.warn("[RESEND] Missing email");
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        console.log("[RESEND] Looking up user by email:", email);
        const [userResult] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND is_verified = false',
            [email]
        );

        if (userResult.length === 0) {
            console.warn("[RESEND] User not found or already verified:", email);
            return res.status(400).json({ message: 'User not found or already verified' });
        }

        const user = userResult[0];
        console.log("[RESEND] User found:", user);

        // Generate new OTP & expiry
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 60 * 1000); // 1 min
        const mysqlOtpExpiresAt = otpExpiresAt.toISOString().slice(0, 19).replace('T', ' ');

        console.log("[RESEND] Updating OTP for user:", user.id, " New OTP:", otp);

        await pool.query(
            'UPDATE users SET otp = ?, otp_expires_at = ? WHERE id = ?',
            [otp, mysqlOtpExpiresAt, user.id]
        );

        // Send mail in background
        sendOTPEmail(email, otp).then(() => {
            console.log("[RESEND] OTP email sent:", email);
        }).catch(err => console.error("[RESEND] Email send error:", err));

        return res.json({
            temp_user_id: user.id,
            message: 'New OTP sent to your email. Expires in 1 minute.'
        });

    } catch (err) {
        console.error("[RESEND] Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};
