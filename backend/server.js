import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/index.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import reviewRoutes from './routes/reviews.js';
import salesPersonRoutes from './routes/salesPerson.js';
import adminUsersRoutes from './routes/adminUsers.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import adminProfileRoutes from './routes/adminProfile.js';
import customerRoutes from './routes/customer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Express Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/profile', adminProfileRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/sales-person', salesPersonRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'OptiBuy Backend API',
    database: 'PostgreSQL',
    schema: process.env.DB_SCHEMA || 'optibuy',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('OptiBuy Backend Server running. Connected to PostgreSQL.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start listening
app.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(`🚀 OptiBuy Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Target DB: ${process.env.DB_NAME || process.env.PGDATABASE || 'postgres'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
  console.log(`==================================================`);
  await initDb();
});
