import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";


// Use DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL;

console.log('Using Supabase database connection');

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set in environment variables.",
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
