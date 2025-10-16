const documentService = require("../services/documentService");

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
     
    // Normalize to array
    const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
       
    const results = [];
    for (const file of files) {
      const fileBufferBase64 = file.data.toString("base64");
      const result = await documentService.uploadToPython(fileBufferBase64, file.name, file.mimetype);
      results.push({
        success: true,
        fileName: file.name,
        docId: result.doc_id,
        chunks: result.chunks_created,
        extracted_text_preview: (result.extracted_text || "").substring(0, 500),
      });
    }
    res.json({ success: true, files: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// FIXED: Now extracts and passes recent_files
exports.searchDocuments = async (req, res) => {
  try {
    const { query, recent_files, n_results } = req.body;  // ✅ Extract all parameters
    
    console.log("Node.js received search request:");
    console.log("  Query:", query);
    console.log("  Recent files:", recent_files);
    console.log("  N results:", n_results);
    
    if (!query) {
      return res.status(400).json({ success: false, error: "No query provided" });
    }

    // ✅ Pass all parameters to Python
    const result = await documentService.searchInPython(query, recent_files, n_results);
    
    console.log("Python response:", result);
    res.json(result);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};