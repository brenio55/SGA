import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log('Iniciando migrações...');
    
    const migrationPath = path.join(__dirname, '../migrations/001_create_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar migração
    await db.db.unsafe(migrationSQL);
    
    console.log('✅ Migrações executadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    process.exit(1);
  }
}

runMigrations();

