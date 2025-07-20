const express = require('express');
const turfRoutes = require('./routes/turfs');

const app = express();

app.use(express.json());

// Test turf routes
app.use('/api/turfs', turfRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Turfs test API is running' });
});

const PORT = 5003;

app.listen(PORT, () => {
  console.log(`Turfs test server running on port ${PORT}`);
}); 