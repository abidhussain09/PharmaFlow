require('dotenv').config();
const authRoutes=require('./routes/auth.js');
const productRoutes=require('./routes/productRoutes.js')
const salesRoutes=require('./routes/salesRoutes.js')
const customerRoutes=require('./routes/customerRoutes.js')
const dashboardRoutes=require('./routes/dashboardRoutes.js')
const cleanupService = require('./services/cleanupService');
const express = require('express');
const app = express();
const cors = require('cors');


const PORT=process.env.PORT||3000;

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // To parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// connect to DB
require('./config/database.js').connect();

// Start guest cleanup service
cleanupService.start();

//mount
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Retail Medicine Shop API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});