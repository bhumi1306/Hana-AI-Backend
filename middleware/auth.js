const jwt = require('jsonwebtoken');

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