const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
require('dotenv').config();

const { swaggerUi, specs } = require('./config/swagger');
const { initializeWebSocket } = require('./config/websocket');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./routes/notifications');
const fileRoutes = require('./routes/files');
const profileRoutes = require('./routes/profile');
const healthRoutes = require('./routes/health');

const app = express();
const server = createServer(app);
const PORT = process.env.BACKEND_PORT || process.env.PORT || 3000;

// Initialize WebSocket
const io = initializeWebSocket(server);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:8080','http://192.168.1.104:8080'],
  credentials: true
}));
app.use(morgan('combined'));

// JSON parsing middleware - exclude file upload routes
app.use((req, res, next) => {
  if (req.path.includes('/image') || req.path.includes('/upload')) {
    // Skip JSON parsing for file upload routes
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SynergySphere API Documentation'
}));

// Redirect root to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/profile', profileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// Only start the server if this file is run directly (not required by tests)
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 SynergySphere API server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔌 WebSocket server initialized`);
  });
}

module.exports = { app, server };
