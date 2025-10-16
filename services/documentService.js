const axios = require("axios");

const PYTHON_API = "http://localhost:8000"; // Flask API running

exports.uploadToPython = async (fileBase64, name, mimeType) => {
  // const type = mimeType.split("/")[1]; // pdf/docx/txt
    // Handle octet-stream fallback
  let type;
  if (mimeType === "application/octet-stream") {
    const ext = name.split(".").pop().toLowerCase();
    if (ext === "pdf") type = "pdf";
    else if (ext === "docx") type = "docx";
    else if (ext === "txt") type = "txt";
    else throw new Error("Unsupported file extension: " + ext);
  } else {
    type = mimeType.split("/")[1];
  }

  const response = await axios.post(`${PYTHON_API}/upload_document`, {
    content: fileBase64,
    type: type,
    name: name,
  });

  return response.data;
};

exports.searchInPython = async (query, recent_files = [], n_results = 5) => {
  const response = await axios.post(`${PYTHON_API}/search_documents`, {
    query: query,
    recent_files: recent_files,
    n_results: n_results,
  });

  return response.data;
};
