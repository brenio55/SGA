import express from 'express';
import cors from 'cors';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();
import db from './db.js';


const app = express();
const port = 3001;

app.use(express.json());
app.use(cors('*'));

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

app.post('/notification', (req, res) => {
  res.send('Hello from the backend!');
});

app.get('/notification', (req, res) => {
  res.send('Hello from the backend!');
});

testDbConnection();

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});