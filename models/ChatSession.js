const { pool } = require('../config/database');

class ChatSession {
  static async createSession(sessionData) {
    const { id, userId, title, createdAt } = sessionData;
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(`
        INSERT INTO chat_sessions (id, user_id, title, created_at) 
        VALUES (?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
          title = VALUES(title),
          updated_at = CURRENT_TIMESTAMP
      `, [id, userId, title, new Date(createdAt)]);

      return result;
    } finally {
      connection.release();
    }
  }

  // static async getSessionsByUserId(userId, limit, offset) {
  //   const connection = await pool.getConnection();

  //   try {
  //     const [sessions] = await connection.execute(`
  //       SELECT id, title, created_at, updated_at 
  //       FROM chat_sessions 
  //       WHERE user_id = ? 
  //       ORDER BY created_at DESC 
  //       LIMIT ? OFFSET ?
  //     `, [userId, limit, offset]);

  //     return sessions;
  //   } finally {
  //     connection.release();
  //   }
  // }
  static async getSessionsByUserId(userId, limit, offset) {
  const connection = await pool.getConnection();

  try {
    // Make sure limit & offset are numbers
    const safeLimit = Number.isInteger(limit) ? limit : 50;
    const safeOffset = Number.isInteger(offset) ? offset : 0;

    const [sessions] = await connection.execute(`
      SELECT id, title, created_at, updated_at 
      FROM chat_sessions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `, [userId]);

    return sessions;
  } finally {
    connection.release();
  }
}

  static async getSessionById(sessionId, userId) {
    const connection = await pool.getConnection();

    try {
      const [sessions] = await connection.execute(`
        SELECT id, title, created_at, updated_at 
        FROM chat_sessions 
        WHERE id = ? AND user_id = ?
      `, [sessionId, userId]);

      return sessions[0] || null;
    } finally {
      connection.release();
    }
  }

  static async deleteSession(sessionId, userId) {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(`
        DELETE FROM chat_sessions 
        WHERE id = ? AND user_id = ?
      `, [sessionId, userId]);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async getSessionCount(userId) {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        'SELECT COUNT(*) as total FROM chat_sessions WHERE user_id = ?',
        [userId]
      );

      return result[0].total;
    } finally {
      connection.release();
    }
  }
}

module.exports = ChatSession;
