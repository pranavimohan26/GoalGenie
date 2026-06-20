import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import goalRoutes from './routes/goalRoutes';
import taskRoutes from './routes/taskRoutes';
import mentorRoutes from './routes/mentorRoutes';
import adminRoutes from './routes/adminRoutes';
import learningRoutes from './routes/learningRoutes';
import { errorHandler } from './middleware/error';
import { checkDbConnection } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for credentials
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/mentor', mentorRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/milestones', learningRoutes);

// Health Check Endpoint
app.get('/health', async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware (must be registered last)
app.use(errorHandler);

// Start Server
const startServer = async () => {
  // Check Database connection before booting server
  await checkDbConnection();
  
  app.listen(PORT, () => {
    console.log(`AI Life Navigator server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
export default app;
