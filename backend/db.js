import postgres from "postgres";
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

const isProduction = process.env.NODE_ENV === 'production';
const db = postgres(connectionString, {
    ssl: isProduction ? { rejectUnauthorized: false } : false
});
console.log('Database url:', connectionString);

export default { db };