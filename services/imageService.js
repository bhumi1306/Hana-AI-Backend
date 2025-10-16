// services/imageService.js
const axios = require('axios');
const PYTHON_API = process.env.PYTHON_API || 'http://localhost:8000';

exports.uploadToPython = async (fileBase64, name, mimeType, prompt = '', sessionId = '') => {
  // guess type if octet-stream
  let type;
  if (mimeType === 'application/octet-stream') {
    const ext = name.split('.').pop().toLowerCase();
    type = ext;
  } else {
    type = mimeType.split('/')[1];
  }

  const response = await axios.post(`${PYTHON_API}/upload_image`, {
    content: fileBase64,
    type: type,
    name: name,
    prompt: prompt,
    session_id: sessionId
  }, { timeout: 270000 }); // images + GLM might be slow

  return response.data;
};
