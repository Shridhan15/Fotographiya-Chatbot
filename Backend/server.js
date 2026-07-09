// ============================================
// ✅ STEP 1: .env LOAD KARO (SABSE PEHLE)
// ============================================
const dotenv = require('dotenv');
dotenv.config();

// ✅ DEBUG: Check API Keys (Groq Only)
console.log('========================================');
console.log('🔑 API Keys Status:');
console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ Found' : '❌ Not found'}`);
console.log('========================================');

// ============================================
// ✅ STEP 2: BAAKI IMPORTS
// ============================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const chatRoutes = require('./src/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ============================================
// ✅ API ROUTES
// ============================================
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Fotographiya Chatbot API',
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'Fotographiya Chatbot API',
    status: 'Running',
    endpoints: {
      sendMessage: 'POST /api/chat/message',
      health: 'GET /health'
    }
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Chat API: http://localhost:${PORT}/api/chat`);
});