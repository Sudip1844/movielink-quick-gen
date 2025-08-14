-- IMPORTANT: Run this in your Supabase SQL Editor to clean up and set up proper tables
-- This will remove any unwanted tables and create the correct MovieZone schema

-- Step 1: Drop any existing tables that might conflict
DROP TABLE IF EXISTS movie_links CASCADE;
DROP TABLE IF EXISTS api_tokens CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;

-- Step 2: Create movie_links table
CREATE TABLE movie_links (
    id BIGSERIAL PRIMARY KEY,
    movie_name TEXT NOT NULL,
    original_link TEXT NOT NULL,
    short_id TEXT NOT NULL UNIQUE,
    views INTEGER NOT NULL DEFAULT 0,
    date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ads_enabled BOOLEAN NOT NULL DEFAULT true
);

-- Step 3: Create api_tokens table
CREATE TABLE api_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_name TEXT NOT NULL,
    token_value TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE
);

-- Step 4: Create admin_settings table
CREATE TABLE admin_settings (
    id BIGSERIAL PRIMARY KEY,
    admin_id TEXT NOT NULL UNIQUE,
    admin_password TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Step 5: Create indexes for better performance
CREATE INDEX idx_movie_links_short_id ON movie_links(short_id);
CREATE INDEX idx_movie_links_date_added ON movie_links(date_added DESC);
CREATE INDEX idx_api_tokens_token_value ON api_tokens(token_value);
CREATE INDEX idx_api_tokens_active ON api_tokens(is_active);

-- Step 6: Insert your admin credentials (replace with your desired credentials)
INSERT INTO admin_settings (admin_id, admin_password) 
VALUES ('sbiswas1844', 'save@184455') 
ON CONFLICT (admin_id) DO NOTHING;

-- Step 7: Enable RLS for security
ALTER TABLE movie_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Step 8: Create policies for public access
CREATE POLICY "Allow all operations on movie_links" ON movie_links
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on api_tokens" ON api_tokens
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access to admin_settings" ON admin_settings
    FOR SELECT USING (true);

-- Step 9: Grant permissions
GRANT ALL ON movie_links TO anon;
GRANT ALL ON movie_links TO authenticated;
GRANT ALL ON api_tokens TO anon;
GRANT ALL ON api_tokens TO authenticated;
GRANT ALL ON admin_settings TO anon;
GRANT ALL ON admin_settings TO authenticated;
GRANT USAGE ON SEQUENCE movie_links_id_seq TO anon;
GRANT USAGE ON SEQUENCE movie_links_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE api_tokens_id_seq TO anon;
GRANT USAGE ON SEQUENCE api_tokens_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE admin_settings_id_seq TO anon;
GRANT USAGE ON SEQUENCE admin_settings_id_seq TO authenticated;

-- Step 10: Verify tables created successfully
SELECT 'MovieZone database setup completed successfully!' as status;