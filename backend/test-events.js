const express = require('express');
const eventRoutes = require('./routes/events');

const app = express();

app.use(express.json());

// Test event routes
app.use('/api/events', eventRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Events test API is running' });
});

const PORT = 5005;

app.listen(PORT, () => {
  console.log(`Events test server running on port ${PORT}`);
}); 