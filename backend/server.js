// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const tokenRoutes = require('./routes/tokenRoutes');
const matchRoutes = require('./routes/matchRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const errorHandler = require('./middleware/errorHandler');
const env = require('./config/env');
const blockchainService = require('./services/blockchainService');

const app = express();
const PORT = env.PORT;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TriX Gaming API' });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('API Documentation: http://localhost:' + PORT + '/api');
  
  // Initialize blockchain service
  try {
    await blockchainService.initializeContracts();
    console.log('Blockchain service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize blockchain service:', error);
  }
});