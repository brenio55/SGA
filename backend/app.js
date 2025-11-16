import express from 'express';
import cors from 'cors';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();
import db from './db.js';

// Import middleware
import requestLogger from './middleware/requestLogger.js';

// Import routes
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import groupRoutes from './routes/groupRoutes.js';

const app = express();
const port = 3001;

app.use(cors('*'));
app.use(express.json());

// Middleware de logging (deve vir depois do express.json para capturar o body)
app.use(requestLogger);

function testDbConnection() {
  db.db`SELECT 1`
    .then(() => {
      console.log('Database connection successful');
    })
    .catch((err) => {
      console.error('Database connection error:', err);
    }
  );
}

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/groups', groupRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

testDbConnection();

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
  console.log(`API endpoints available at http://localhost:${port}/api`);
});