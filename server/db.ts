import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Supabase connection string
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Sudipb184495@db.cfbgcvbrjwtvzxxtfmhh.supabase.co:5432/postgres";

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const client = postgres(connectionString, { 
  ssl: 'require',
  max: 1 
});
export const db = drizzle(client, { schema });
