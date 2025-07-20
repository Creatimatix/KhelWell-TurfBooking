const express = require('express');
const bookingRoutes = require('./routes/bookings');

const app = express();

app.use(express.json());

// Test booking routes
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bookings test API is running' });
});

const PORT = 5004;

app.listen(PORT, () => {
  console.log(`Bookings test server running on port ${PORT}`);
}); 