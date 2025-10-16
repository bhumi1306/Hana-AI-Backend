// controllers/logoutController.js
const logoutService = require('../services/logoutService');

exports.logoutUser = async (req, res) => {
    const { userId } = req.params;   // from URL params
    const authUserId = req.user.userId; // from token (middleware)

    if (parseInt(userId) !== authUserId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized: Cannot logout another user",
            error: "UNAUTHORIZED_LOGOUT"
        });
    }

    try {
        const response = await logoutService.logoutUser(userId);
        res.json(response);
    } catch (err) {
        console.error("[LOGOUT] Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
