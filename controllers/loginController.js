const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log("[LOGIN] Incoming request:", { email });

    if (!email || !password) {
        console.warn("[LOGIN] Missing fields");
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        console.log("[LOGIN] Looking up user:", email);
        const [userResult] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (userResult.length === 0) {
            console.warn("[LOGIN] User not found:", email);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = userResult[0];
        console.log("[LOGIN] User found:", user.email);

        if (!user.is_verified) {
            console.warn("[LOGIN] User not verified:", user.email);
            return res.status(400).json({ message: 'Please verify your email before logging in' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            console.warn("[LOGIN] Invalid password for:", user.email);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log("[LOGIN] Password correct, generating JWT...");

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        console.log("[LOGIN] JWT generated for user:", user.id);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                is_verified: !!user.is_verified
            }
        });

    } catch (err) {
        console.error("[LOGIN] Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};
