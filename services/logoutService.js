// services/logoutService.js
const pool = require('../db');

exports.logoutUser = async (userId) => {
    console.log("[LOGOUT] Logging out user:", userId);

    await pool.query('UPDATE users SET is_logged_in = 0 WHERE id = ?', [userId]);

    return { 
        success: true,
        message: "Logged out successfully" 
    };
};
