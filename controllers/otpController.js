const pool = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyOTP = async (req, res) => {
    const { temp_user_id, otp } = req.body;

    console.log("[VERIFY] Incoming request:", { temp_user_id, otp });

    if (!temp_user_id || !otp) {
        console.warn("[VERIFY] Missing fields");
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        console.log("[VERIFY] Looking up user ID:", temp_user_id);
        const [userResult] = await pool.query(
            'SELECT * FROM users WHERE id = ? AND is_verified = false',
            [temp_user_id]
        );

        if (userResult.length === 0) {
            console.warn("[VERIFY] User not found or already verified:", temp_user_id);
            return res.status(400).json({ message: 'User not found or already verified' });
        }

        const user = userResult[0];
        console.log("[VERIFY] User found:", user);

        const nowUTC = new Date().toISOString().slice(0, 19).replace('T', ' '); // UTC string

        console.log("[VERIFY] Current UTC time:", nowUTC, " OTP expires at (DB):", user.otp_expires_at);

        if (!user.otp || new Date(nowUTC) > new Date(user.otp_expires_at)) {
            console.warn("[VERIFY] OTP expired for user:", user.id);
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (user.otp !== otp) {
            console.warn("[VERIFY] Invalid OTP entered for user:", user.id);
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        console.log("[VERIFY] OTP valid, verifying user...");

        await pool.query(
            'UPDATE users SET is_verified = true, otp = NULL, otp_expires_at = NULL WHERE id = ?',
            [temp_user_id]
        );

        console.log("[VERIFY] User verified:", user.id);

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        console.log("[VERIFY] JWT generated for user:", user.id);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                is_verified: true
            }
        });

    } catch (err) {
        console.error("[VERIFY] Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};
