const registerService = require('../services/registerService');

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    console.log("[REGISTER] Incoming request:", { username, email });

    if (!username || !email || !password) {
        console.warn("[REGISTER] Missing fields");
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const response = await registerService.registerUser(username, email, password);
        res.json(response);
    } catch (err) {
        console.error("[REGISTER] Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};
