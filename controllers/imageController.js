// controllers/imageController.js
const imageService = require('../services/imageService');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.file) return res.status(400).json({ success: false, error: "No file uploaded" });

    const file = req.files.file;
    const prompt = req.body.prompt || '';
    const sessionId = req.body.sessionId || ''; // optional: chat session id

    // Convert to base64
    const fileBase64 = file.data.toString('base64');

    // Forward to Python
    const result = await imageService.uploadToPython(fileBase64, file.name, file.mimetype, prompt, sessionId);

    // result should include: image_id, analysis_text, preview (optional), embeddings info
    // Store a chat message in SQL (so chat history contains this image)
    // Assuming you have a model to insert single message (not rewrite all createMessages)
    // const ChatMessage = require('../models/chat_message_single');
    // await ChatMessage.createSingleMessage(sessionId || generateSessionId(), {
    //   role: 'user',
    //   text: prompt,
    //   image_name: file.name,
    //   image_id: result.image_id,
    //   image_url: result.image_url || null,
    //   image_preview_text: result.analysis_text?.substring(0, 400) || null
    // });

    // Return to frontend
    res.json({
      success: true,
      image_id: result.image_id,
      analysis: result.analysis_text,
      preview: result.preview,
      image_url: result.image_url
    });
  } catch (err) {
    console.error("uploadImage error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

function generateSessionId() {
  return Date.now().toString();
}
