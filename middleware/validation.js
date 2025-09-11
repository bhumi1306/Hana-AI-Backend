const validateChatHistory = (req, res, next) => {
  const { chatHistory } = req.body;

  if (!chatHistory) {
    return res.status(400).json({
      success: false,
      message: 'Chat history is required',
      error: 'MISSING_CHAT_HISTORY'
    });
  }

  if (!Array.isArray(chatHistory)) {
    return res.status(400).json({
      success: false,
      message: 'Chat history must be an array',
      error: 'INVALID_FORMAT'
    });
  }

  // Validate each session structure
  for (let i = 0; i < chatHistory.length; i++) {
    const session = chatHistory[i];
    
    if (!session.id || !session.title || !session.messages) {
      return res.status(400).json({
        success: false,
        message: `Invalid session structure at index ${i}`,
        error: 'INVALID_SESSION_STRUCTURE'
      });
    }

    if (!Array.isArray(session.messages)) {
      return res.status(400).json({
        success: false,
        message: `Messages must be an array at session index ${i}`,
        error: 'INVALID_MESSAGES_FORMAT'
      });
    }
  }

  next();
};

const validatePagination = (req, res, next) => {
  const { limit = 50, offset = 0 } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedOffset = parseInt(offset);

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be a number between 1 and 100',
      error: 'INVALID_LIMIT'
    });
  }

  if (isNaN(parsedOffset) || parsedOffset < 0) {
    return res.status(400).json({
      success: false,
      message: 'Offset must be a non-negative number',
      error: 'INVALID_OFFSET'
    });
  }

  req.pagination = { limit: parsedLimit, offset: parsedOffset };
  next();
};

module.exports = {
  validateChatHistory,
  validatePagination
};