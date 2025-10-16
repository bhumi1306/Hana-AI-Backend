const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");

// Upload an image and send to Python (chroma)
router.post("/upload", imageController.uploadImage);

module.exports = router;
