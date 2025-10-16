const pool = require('../db');
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// GET /api/profile
exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;// from JWT middleware

        console.log("[PROFILE] Incoming request:", { userId });

        const [rows] = await pool.query(
            'SELECT id, username, email, avatar_url FROM users WHERE id = ?',
            parseInt(userId)
        );

        if (rows.length === 0) {
            console.log("User not found");
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("Returning rows");
        res.json(rows[0]);
    } catch (err) {
        console.error("[PROFILE] Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/profile
exports.updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;// from JWT middleware
        const { username, email, avatar_url } = req.body;

        console.log("[PROFILE] Incoming request:", { userId });

        await pool.query(
            'UPDATE users SET username = ?, email = ?, avatar_url = ? WHERE id = ?',
            [username, email, avatar_url, parseInt(userId)]
        );
        console.log("Updated profile");
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error("[PROFILE] Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ======= UPLOAD CONFIG =======
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ======= UPLOAD AVATAR (Gallery/Camera) =======
exports.uploadAvatar = [
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (err) {
      console.error("[UPLOAD] Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
];

// ======= GET PREDEFINED AVATARS =======
exports.getAvatars = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, url FROM avatars");
    res.json(rows);
  } catch (err) {
    console.error("[AVATARS] Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

