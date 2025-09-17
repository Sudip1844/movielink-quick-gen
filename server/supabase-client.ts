// Supabase REST API client for database operations
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseConfigured = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY;

const headers: Record<string, string> = isSupabaseConfigured ? {
  'apikey': SUPABASE_SERVICE_ROLE_KEY!,
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
} : {};

export class SupabaseClient {
  private baseUrl: string;

  constructor() {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase not configured - some features may not work');
      this.baseUrl = '';
      return;
    }
    this.baseUrl = `${SUPABASE_URL}/rest/v1`;
    console.log('✓ Supabase REST client initialized');
  }

  async query(sql: string): Promise<any> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }
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
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }
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

      const result = await response.json();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Supabase select error:', error);
      return [];
    }
  }

  async insert(table: string, data: any): Promise<any> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }
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
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }
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
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }
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
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase not configured - connection test skipped');
      return false;
    }
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