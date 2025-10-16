const pool = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyOTP = async (temp_user_id, otp) => {
    console.log("[VERIFY] Looking up user ID:", temp_user_id);
    const [userResult] = await pool.query(
        'SELECT * FROM users WHERE id = ? AND is_verified = false',
        [temp_user_id]
    );

    if (userResult.length === 0) {
        console.warn("[VERIFY] User not found or already verified:", temp_user_id);
        throw { status: 400, message: 'User not found or already verified' };
    }

    const user = userResult[0];
    console.log("[VERIFY] User found:", user);

    const nowUTC = new Date().toISOString().slice(0, 19).replace('T', ' '); // UTC string
    console.log("[VERIFY] Current UTC time:", nowUTC, " OTP expires at (DB):", user.otp_expires_at);

    if (!user.otp || new Date(nowUTC) > new Date(user.otp_expires_at)) {
        console.warn("[VERIFY] OTP expired for user:", user.id);
        throw { status: 400, message: 'OTP expired' };
    }

    if (user.otp !== otp) {
        console.warn("[VERIFY] Invalid OTP entered for user:", user.id);
        throw { status: 400, message: 'Invalid OTP' };
    }

    console.log("[VERIFY] OTP valid, verifying user...");
    await pool.query(
        'UPDATE users SET is_verified = true, otp = NULL, otp_expires_at = NULL WHERE id = ?',
        [temp_user_id]
    );

    console.log("[VERIFY] User verified:", user.id);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    console.log("[VERIFY] JWT generated for user:", user.id);

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            is_verified: true
        }
    };
};
