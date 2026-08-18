import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import employeeRoutes from './routes/employeeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration for local development & Vercel deployment
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, postman, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url} - Role: ${req.headers['x-user-role'] || 'Admin'}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Org Chart Backend Service',
    database: 'MongoDB'
  });
});

// API Routes
app.use('/api/employees', employeeRoutes);

// Start Server
const startServer = async () => {
  console.log(`Starting Org Chart Backend Service on port ${PORT}...`);
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Backend Server running on port ${PORT}`);
    console.log(`📡 MongoDB API active at /api/employees`);
    console.log(`======================================================\n`);
  });
};

startServer();
