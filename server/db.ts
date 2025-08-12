import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Load environment configuration from .env file
function loadEnvConfig() {
  try {
    // Try to load env-config.js dynamically
    return require('../env-config.js');
  } catch (error) {
    console.log('env-config.js not found, using environment variables');
    return {};
  }
}

const envConfig = loadEnvConfig();

// Supabase connection string from .env file
const connectionString = process.env.DATABASE_URL || envConfig.DATABASE_URL;

console.log('Database connection status:', connectionString ? 'DATABASE_URL found' : 'DATABASE_URL missing');

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Check env-config.js or environment variables.",
  );
}

const client = postgres(connectionString, { 
  ssl: connectionString.includes('supabase.co') ? 'require' : false,
  max: 1 
});
export const db = drizzle(client, { schema });
