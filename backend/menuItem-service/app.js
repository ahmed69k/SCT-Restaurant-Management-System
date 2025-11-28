require('dotenv').config({path:require('path').resolve(__dirname, '../.env')})
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const menuItemRoutes = require('./Router/menuItemRouter');

const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_LINK,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

// Connect to MongoDB (each service has its own DB or collection)
mongoose.connect('mongodb://localhost:27017/menuitem-db')
  .then(() => console.log('MenuItem Service → MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/v1/menu', menuItemRoutes);

app.get('/', (req, res) => {
  res.send('MenuItem Service is running');
});

const PORT = process.env.MENUITEM_PORT;
app.listen(PORT, () => {
  console.log(`MenuItem Service running on port ${PORT}`);
});