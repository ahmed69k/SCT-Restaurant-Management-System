require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const menuItemRoutes = require('./Router/menuItemRouter');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (each service has its own DB or collection)
mongoose.connect('mongodb://localhost:27017/menuitem-db')
  .then(() => console.log('MenuItem Service → MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/menu', menuItemRoutes);

app.get('/', (req, res) => {
  res.send('MenuItem Service is running');
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`MenuItem Service running on port ${PORT}`);
});