const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");

// Upload a document and send to Python (chroma)
router.post("/upload", documentController.uploadDocument);

// Search documents
router.post("/search", documentController.searchDocuments);

module.exports = router;
