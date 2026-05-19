import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Import all tables and relations
import * as schema from './schema/index.js';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:password@localhost:5432/pawfectcare',
});

// Initialize Drizzle with schema and pool
export const db = drizzle(pool, { schema });

// Optional: export pool too (for raw queries or closing connection)
export { pool };
