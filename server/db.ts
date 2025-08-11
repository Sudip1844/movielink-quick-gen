import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Load environment configuration
let envConfig;
try {
  envConfig = require('../env-config.js');
} catch (error) {
  envConfig = {};
}

// Supabase connection string
const connectionString = process.env.DATABASE_URL || envConfig.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Check env-config.js or environment variables.",
  );
}

const client = postgres(connectionString, { 
  ssl: 'require',
  max: 1 
});
export const db = drizzle(client, { schema });
