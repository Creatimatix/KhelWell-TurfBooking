const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());

// Test auth routes
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Auth test API is running' });
});

const PORT = 5002;

app.listen(PORT, () => {
  console.log(`Auth test server running on port ${PORT}`);
}); 