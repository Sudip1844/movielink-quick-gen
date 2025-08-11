import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Load environment configuration synchronously
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

// Supabase connection string
const connectionString = process.env.DATABASE_URL || envConfig.DATABASE_URL || "postgresql://postgres:Sudipb184495@db.cfbgcvbrjwtvzxxtfmhh.supabase.co:5432/postgres";

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
