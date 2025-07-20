const express = require('express');
const app = express();

app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test API is running' });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
}); 