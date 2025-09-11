const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

const saveChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { chatHistory } = req.body;

    let savedCount = 0;

    // Process each chat session
    for (const session of chatHistory) {
      const { id, title, createdAt, messages } = session;

      if (!id || !title || !messages || !Array.isArray(messages)) {
        continue; // Skip invalid sessions
      }

      // Create or update session
      await ChatSession.createSession({
        id,
        userId: parseInt(userId),
        title,
        createdAt
      });

      // Create messages
      await ChatMessage.createMessages(id, messages);
      savedCount++;
    }

    res.json({
      success: true,
      message: 'Chat history saved successfully',
      savedSessions: savedCount
    });

  } catch (error) {
    console.error('Error saving chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, offset } = req.pagination;

    // Get chat sessions
    const sessions = await ChatSession.getSessionsByUserId(
      parseInt(userId), 
      limit, 
      offset
    );

    // Get messages for each session
    const chatHistory = [];
    for (const session of sessions) {
      const messages = await ChatMessage.getMessagesBySessionId(session.id);
      
      chatHistory.push({
        id: session.id,
        title: session.title,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
        messages
      });
    }

    // Get total count for pagination
    const total = await ChatSession.getSessionCount(parseInt(userId));

    res.json({
      success: true,
      data: {
        chatHistory,
        pagination: {
          total,
          limit,
          offset,
          hasMore: (offset + limit) < total
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getChatSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    // Get the specific session
    const session = await ChatSession.getSessionById(sessionId, parseInt(userId));

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Get messages for the session
    const messages = await ChatMessage.getMessagesBySessionId(sessionId);

    const chatSession = {
      id: session.id,
      title: session.title,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      messages
    };

    res.json({
      success: true,
      data: chatSession
    });

  } catch (error) {
    console.error('Error retrieving chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteChatSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    const deleted = await ChatSession.deleteSession(sessionId, parseInt(userId));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  saveChatHistory,
  getChatHistory,
  getChatSession,
  deleteChatSession
};
