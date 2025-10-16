const jwt = require('jsonwebtoken');
const pool = require('../db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required',
      error: 'MISSING_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Check if user is logged in
    const [rows] = await pool.query(
      'SELECT is_logged_in FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    if (rows[0].is_logged_in === 0) {
      return res.status(403).json({
        success: false,
        message: 'User is logged out',
        error: 'LOGGED_OUT'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    let message = 'Invalid token';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token format';
    }

    return res.status(403).json({ 
      success: false, 
      message,
      error: error.name
    });
  }
};

const authorizeUser = (req, res, next) => {
  const { userId } = req.params;
  
  if (req.user.userId !== parseInt(userId)) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: Cannot access other user\'s data',
      error: 'UNAUTHORIZED_ACCESS'
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  authorizeUser
};