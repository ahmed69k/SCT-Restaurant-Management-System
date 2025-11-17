require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const menuItemRoutes = require('./Router/menuItemRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (each service has its own DB or collection)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/menuitem-db')
  .then(() => console.log('MenuItem Service → MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/menu', menuItemRoutes);

app.get('/', (req, res) => {
  res.send('MenuItem Service is running');
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`MenuItem Service running on port ${PORT}`);
});