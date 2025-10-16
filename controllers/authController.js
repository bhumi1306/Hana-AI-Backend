// controllers/authController.js
const pool = require("../db");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebase");
const JWT_SECRET = process.env.JWT_SECRET;

exports.googleLogin = async (req, res) => {
  const { idToken } = req.body; // from client

  if (!idToken) {
    return res.status(400).json({ message: "ID token required" });
  }

  try {
    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    console.log("[GOOGLE LOGIN] Decoded token:", { uid, email, name });

    // Check if user exists in DB
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    let user;
    if (existingUser.length > 0) {
      user = existingUser[0];

      if (!user.is_verified) {
        // Mark as verified since Google verified the email
        await pool.query(
          "UPDATE users SET is_verified = true WHERE id = ?",
          [user.id]
        );
        user.is_verified = true;
      }
      //Mark user as logged in
      await pool.query("UPDATE users SET is_logged_in = 1 WHERE id = ?", [
        user.id,
      ]);
      user.is_logged_in = 1;
    } else {
      // Insert new user without password/OTP
      const [result] = await pool.query(
        "INSERT INTO users (username, email, password_hash, is_verified, is_logged_in) VALUES (?, ?, ?, ?, ?)",
        [name || "GoogleUser", email, "", true, 1]
      );
      user = {
        id: result.insertId,
        username: name || "GoogleUser",
        email,
        is_verified: true,
        is_logged_in: 1,
      };
    }

    // Generate JWT for session
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_verified: true,
        is_logged_in: 1,
      },
    });
  } catch (err) {
    console.error("[GOOGLE LOGIN] Error:", err);
    res.status(500).json({ message: "Invalid Google login" });
  }
};
