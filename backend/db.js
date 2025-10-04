import postgres from "postgres";
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const db = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
console.log('Database url:', connectionString);

export default { db };