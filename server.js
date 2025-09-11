require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const express = require('express');
const bodyParser = require('body-parser');
const { testConnection } = require('./config/database');
const chatHistoryRoutes = require('./routes/chatHistory');

const registerRoutes = require('./routes/register');
const otpRoutes = require('./routes/verifyOtp');
const loginRoutes = require('./routes/login');
const resendOtpRoutes = require('./routes/resendOtp');
const googleAuthRoutes = require('./routes/googleAuth');

const app = express();

// Body parser middleware (moved up before routes)
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

// Apply rate limiting to specific routes
app.use('/api/', limiter);

// Routes
app.use('/api', registerRoutes);
app.use('/api', otpRoutes);
app.use('/api', loginRoutes);
app.use('/api', resendOtpRoutes);
app.use('/api', googleAuthRoutes);
app.use('/api/chat-history', chatHistoryRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  
  res.json({
    success: true,
    message: 'Chat History API is running',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler - FIXED: Changed from '*' to catch-all middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
const startServer = async () => {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('Failed to connect to database. Server not started.');
    process.exit(1);
  }
  
  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://0.0.0.0:3000");
  });
};

startServer();

module.exports = app;