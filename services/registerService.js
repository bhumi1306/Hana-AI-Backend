const pool = require('../db');
const bcrypt = require('bcrypt');
const generateOTP = require('../utils/generateOTP');
const sendOTPEmail = require('../utils/emailService');

exports.registerUser = async (username, email, password) => {
    console.log("[REGISTER] Checking if email exists:", email);
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log("[REGISTER] Existing user check result:", existingUser);

    if (existingUser.length > 0) {
        const user = existingUser[0];
        if (user.is_verified) {
            console.warn("[REGISTER] Email already verified:", email);
            throw { status: 400, message: 'Email already exists' };
        } else {
            console.log("[REGISTER] Email found but not verified. Updating OTP...");

            const otp = generateOTP();
            const otpExpiresAt = new Date(Date.now() + 60 * 1000)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' '); // UTC

            await pool.query(
                'UPDATE users SET otp = ?, otp_expires_at = ? WHERE email = ?',
                [otp, otpExpiresAt, email]
            );

            console.log("[REGISTER] OTP updated for:", email, " OTP:", otp);

            sendOTPEmail(email, otp).then(() => {
                console.log("[REGISTER] OTP email sent:", email);
            }).catch(err => console.error("[REGISTER] Email send error:", err));

            return {
                temp_user_id: user.id,
                message: 'New OTP sent to your email. Expires in 1 minute.'
            };
        }
    }

    console.log("[REGISTER] New user, hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 60 * 1000);
    const mysqlOtpExpiresAt = otpExpiresAt.toISOString().slice(0, 19).replace('T', ' ');

    console.log("[REGISTER] Inserting new user with OTP:", otp);

    const [result] = await pool.query(
        'INSERT INTO users (username, email, password_hash, otp, otp_expires_at) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, otp, mysqlOtpExpiresAt]
    );

    const userId = result.insertId;
    console.log("[REGISTER] User inserted with ID:", userId);

    sendOTPEmail(email, otp).then(() => {
        console.log("[REGISTER] OTP email sent:", email);
    }).catch(err => console.error("[REGISTER] Email send error:", err));

    return {
        temp_user_id: userId,
        message: 'OTP sent to your email. Expires in 1 minute.'
    };
};
