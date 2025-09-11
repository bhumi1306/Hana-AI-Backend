const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeUser } = require('../middleware/auth');
const { validateChatHistory, validatePagination } = require('../middleware/validation');
const {
  saveChatHistory,
  getChatHistory,
  getChatSession,
  deleteChatSession
} = require('../controllers/chatHistoryController');

// Apply authentication to all routes
router.use(authenticateToken);

// Save chat history
router.post('/:userId', 
  authorizeUser,
  validateChatHistory,
  saveChatHistory
);

// Get all chat history for user
router.get('/:userId',
  authorizeUser,
  validatePagination,
  getChatHistory
);

// Get specific chat session
router.get('/:userId/:sessionId',
  authorizeUser,
  getChatSession
);

// Delete specific chat session
router.delete('/:userId/:sessionId',
  authorizeUser,
  deleteChatSession
);

module.exports = router;