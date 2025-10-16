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
         const { role, text, doc, image } = message;
        
        if (role && text && (role === 'user' || role === 'bot')) {
           const docName = doc?.name || null;
           const docType = doc?.type || null;

          const imageName = image?.name || null;
          const imageId = image?.image_id || null;
          const imagePreview = image?.preview_text || null;
          const imageUrl = image?.url || null;

          await connection.execute(`
            INSERT INTO chat_messages (
              session_id, role, message_text, 
              doc_name, doc_type,
              image_name, image_id, image_preview,image_url
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            sessionId,
            role,
            text,
            docName,
            docType,
            imageName,
            imageId,
            imagePreview,
            imageUrl
          ]);
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
        SELECT 
          role, 
          message_text as text, 
          doc_name, 
          doc_type, 
          image_name, 
          image_id, 
          image_preview,
          image_url,
          created_at 
        FROM chat_messages 
        WHERE session_id = ? 
        ORDER BY created_at ASC
      `, [sessionId]);

      return messages.map(msg => ({
        role: msg.role,
        text: msg.text,
        doc: msg.doc_name ? { name: msg.doc_name, type: msg.doc_type } : undefined,
        image: msg.image_name ? {
        name: msg.image_name,
        image_id: msg.image_id,
        preview_text: msg.image_preview,
        url: msg.image_url
        } : undefined
      }));
    } finally {
      connection.release();
    }
  }
}

module.exports = ChatMessage;