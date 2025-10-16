const loginService = require('../services/loginService');

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log("[LOGIN] Incoming request:", { email });

    if (!email || !password) {
        console.warn("[LOGIN] Missing fields");
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const response = await loginService.loginUser(email, password);
        res.json(response);
    } catch (err) {
        console.error("[LOGIN] Error:", err);

        // Custom service errors
        if (err.status) {
            return res.status(err.status).json({ message: err.message });
        }

        res.status(500).json({ message: 'Server error' });
    }
};
