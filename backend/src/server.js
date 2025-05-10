// Load environment variables from .env
require('dotenv').config();

// Debug print to confirm the vars loaded
console.log(
  'Loaded ENV:',
  'DB_HOST=', process.env.DB_HOST,
  'DB_USER=', process.env.DB_USER,
  'DB_PASS?=', !!process.env.DB_PASS,
  'DB_NAME=', process.env.DB_NAME
);

// Imports
const express = require('express');
const cors = require('cors');
const { connect } = require('./config/db');
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');

const app = express();

//Global middleware
app.use(cors());
app.use(express.json());

//Authentication routes (public)
app.use('/api/auth', authRouter);

//Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

//Product routes
app.use('/api/products', productsRouter);

//Inspect DB module
console.log('DB module exports:', require('./config/db'));

async function start() {
  await connect();  // Connect to SQL Server
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start();
