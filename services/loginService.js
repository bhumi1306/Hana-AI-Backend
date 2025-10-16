const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.loginUser = async (email, password) => {
    console.log("[LOGIN] Looking up user:", email);
    const [userResult] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    if (userResult.length === 0) {
        console.warn("[LOGIN] User not found:", email);
        throw { status: 400, message: 'Invalid email or password' };
    }

    const user = userResult[0];
    console.log("[LOGIN] User found:", user.email);

    if (!user.is_verified) {
        console.warn("[LOGIN] User not verified:", user.email);
        throw { status: 400, message: 'Please verify your email before logging in' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
        console.warn("[LOGIN] Invalid password for:", user.email);
        throw { status: 400, message: 'Invalid email or password' };
    }

    console.log("[LOGIN] Password correct, generating JWT...");
     // Mark user logged in
    await pool.query('UPDATE users SET is_logged_in = 1 WHERE id = ?', [user.id]);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    console.log("[LOGIN] JWT generated for user:", user.id);

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            is_verified: !!user.is_verified,
            is_logged_in: 1
        }
    };
};
