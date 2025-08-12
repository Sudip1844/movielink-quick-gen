// Supabase REST API client for database operations
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ztorzqnvzxbptmdmaqyi.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b3J6cW52enhicHRtZG1hcXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjYxMjYsImV4cCI6MjA3MDUwMjEyNn0.ZTLe9cFaqRGhXnBbm9wxaYCyGS-fg7jXZEmzXK-EYns";

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export class SupabaseClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/rest/v1`;
    console.log('✓ Supabase REST client initialized');
  }

  async query(sql: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/rpc/execute_sql`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql })
      });
      
      if (!response.ok) {
        throw new Error(`Supabase query failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
  }

  async select(table: string, columns = '*', where?: any): Promise<any[]> {
    try {
      let url = `${this.baseUrl}/${table}?select=${columns}`;
      
      if (where) {
        const conditions = Object.entries(where)
          .map(([key, value]) => `${key}=eq.${value}`)
          .join('&');
        url += `&${conditions}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Supabase select failed: ${response.statusText}`);
      }

      return await response.json() as any[];
    } catch (error) {
      console.error('Supabase select error:', error);
      throw error;
    }
  }

  async insert(table: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${table}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Supabase insert failed: ${response.statusText}`);
      }

      const result = await response.json();
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
  }

  async update(table: string, data: any, where: any): Promise<any> {
    try {
      const conditions = Object.entries(where)
        .map(([key, value]) => `${key}=eq.${value}`)
        .join('&');

      const response = await fetch(`${this.baseUrl}/${table}?${conditions}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Supabase update failed: ${response.statusText}`);
      }

      const result = await response.json();
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
  }

  async delete(table: string, where: any): Promise<void> {
    try {
      const conditions = Object.entries(where)
        .map(([key, value]) => `${key}=eq.${value}`)
        .join('&');

      const response = await fetch(`${this.baseUrl}/${table}?${conditions}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Supabase delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/movie_links?limit=1`, {
        method: 'GET',
        headers
      });
      
      console.log('✓ Supabase REST API connection successful');
      return response.ok;
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
  }
}

export const supabase = new SupabaseClient();