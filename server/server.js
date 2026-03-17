require('dotenv').config();
const express = require('express');
const cors = require('cors');
const redirectRoutes = require('./routes/redirectRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Allow all origins so that frontend can be hosted anywhere (Firebase, Vercel, etc.)
// without needing backend updates for domain changes.
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', redirectRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 WhereGoes server running on http://localhost:${PORT}`);
});
