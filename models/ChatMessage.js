const { pool } = require('../config/database');

class ChatMessage {
  static async createMessages(sessionId, messages) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Delete existing messages for this session
      await connection.execute(
        'DELETE FROM chat_messages WHERE session_id = ?',
        [sessionId]
      );

      // Insert new messages
      for (const message of messages) {
        const { role, text } = message;
        
        if (role && text && (role === 'user' || role === 'bot')) {
          await connection.execute(`
            INSERT INTO chat_messages (session_id, role, message_text) 
            VALUES (?, ?, ?)
          `, [sessionId, role, text]);
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getMessagesBySessionId(sessionId) {
    const connection = await pool.getConnection();

    try {
      const [messages] = await connection.execute(`
        SELECT role, message_text as text, created_at 
        FROM chat_messages 
        WHERE session_id = ? 
        ORDER BY created_at ASC
      `, [sessionId]);

      return messages.map(msg => ({
        role: msg.role,
        text: msg.text
      }));
    } finally {
      connection.release();
    }
  }
}

module.exports = ChatMessage;