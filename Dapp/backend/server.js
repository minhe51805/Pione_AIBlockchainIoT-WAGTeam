const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const pool = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n📥 [${timestamp}] ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({
      status: 'ok',
      timestamp: result.rows[0].time,
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.url
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 AquaMind Backend API');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🗄️  Database: ${process.env.PGDATABASE}@${process.env.PGHOST}:${process.env.PGPORT}`);
  console.log('\n📚 Available endpoints:');
  console.log('   GET  /api/health - Health check');
  console.log('   POST /api/auth/register - Register new user');
  console.log('   POST /api/auth/login - Login with credential');
  console.log('   GET  /api/auth/user/:id - Get user by ID');
  console.log('\n⏳ Waiting for requests...\n');
});
