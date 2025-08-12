import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Load environment variables from .env file
require('dotenv').config();

// Load environment configuration from .env file  
function loadEnvConfig() {
  try {
    return require('../env-config.js');
  } catch (error) {
    return {};
  }
}

const envConfig = loadEnvConfig();

// Use Supabase connection from .env file (not Replit's PostgreSQL)
const connectionString = "postgresql://postgres:Sudipb184495@db.ztorzqnvzxbptmdmaqyi.supabase.co:5432/postgres";

console.log('Using Supabase database connection');

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Check env-config.js or environment variables.",
  );
}

const client = postgres(connectionString, { 
  ssl: { rejectUnauthorized: false },
  max: 1,
  connection: {
    application_name: 'moviezone_app'
  },
  connect_timeout: 10,
  idle_timeout: 20
});
export const db = drizzle(client, { schema });
