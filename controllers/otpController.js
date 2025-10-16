const otpService = require('../services/otpService');

exports.verifyOTP = async (req, res) => {
    const { temp_user_id, otp } = req.body;

    console.log("[VERIFY] Incoming request:", { temp_user_id, otp });

    if (!temp_user_id || !otp) {
        console.warn("[VERIFY] Missing fields");
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const response = await otpService.verifyOTP(temp_user_id, otp);
        res.json(response);
    } catch (err) {
        console.error("[VERIFY] Error:", err);

        // Custom service errors
        if (err.status) {
            return res.status(err.status).json({ message: err.message });
        }

        res.status(500).json({ message: 'Server error' });
    }
};
