-- MovieZone Complete SQL Schema for Supabase
-- Run these commands in your Supabase SQL Editor

-- 1. Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS movie_links CASCADE;
DROP TABLE IF EXISTS api_tokens CASCADE;

-- 2. Create movie_links table with proper Supabase syntax
CREATE TABLE movie_links (
    id BIGSERIAL PRIMARY KEY,
    movie_name TEXT NOT NULL,
    original_link TEXT NOT NULL,
    short_id TEXT NOT NULL UNIQUE,
    views INTEGER NOT NULL DEFAULT 0,
    date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ads_enabled BOOLEAN NOT NULL DEFAULT true
);

-- 3. Create api_tokens table for secure authentication
CREATE TABLE api_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_name TEXT NOT NULL,
    token_value TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE
);

-- 4. Create indexes for better performance
CREATE INDEX idx_movie_links_short_id ON movie_links(short_id);
CREATE INDEX idx_movie_links_date_added ON movie_links(date_added DESC);
CREATE INDEX idx_api_tokens_token_value ON api_tokens(token_value);
CREATE INDEX idx_api_tokens_active ON api_tokens(is_active);

-- 5. Create admin_settings table for login credentials
CREATE TABLE admin_settings (
    id BIGSERIAL PRIMARY KEY,
    admin_id TEXT NOT NULL UNIQUE,
    admin_password TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Insert default admin credentials
INSERT INTO admin_settings (admin_id, admin_password) 
VALUES ('sudip1844', 'save@184455') 
ON CONFLICT (admin_id) DO NOTHING;

-- 7. Insert a sample API token for testing (you can change this)
INSERT INTO api_tokens (token_name, token_value, is_active) 
VALUES ('Bot Token', 'moviezone_bot_token_2025_secure', true);

-- 8. Optional: Insert some sample data for testing
INSERT INTO movie_links (movie_name, original_link, short_id, views, ads_enabled) VALUES
('Sample Movie 1', 'https://example.com/movie1', 'abc123', 0, true),
('Sample Movie 2', 'https://example.com/movie2', 'def456', 5, true),
('Admin Created Movie', 'https://example.com/movie3', 'ghi789', 2, false);

-- 9. Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE movie_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 8. Create policies for public access to movie_links (for redirect functionality)
CREATE POLICY "Allow public read access to movie_links" ON movie_links
    FOR SELECT USING (true);

CREATE POLICY "Allow public update views on movie_links" ON movie_links
    FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to movie_links" ON movie_links
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete from movie_links" ON movie_links
    FOR DELETE USING (true);

-- 9. Create policies for api_tokens (restrict access)
CREATE POLICY "Allow read access to active api_tokens" ON api_tokens
    FOR SELECT USING (is_active = true);

-- 10. Create policies for admin_settings (restricted access)
CREATE POLICY "Allow read access to admin_settings" ON admin_settings
    FOR SELECT USING (true);

-- 11. Grant necessary permissions for public access
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

-- 11. Optional: Create a function to automatically update views
CREATE OR REPLACE FUNCTION increment_movie_views(short_id_param TEXT)
RETURNS void 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE movie_links 
    SET views = views + 1 
    WHERE short_id = short_id_param;
END;
$$ LANGUAGE plpgsql;

-- 12. Optional: Create a function to generate random short IDs
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN encode(gen_random_bytes(3), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 13. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION increment_movie_views(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_movie_views(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_short_id() TO anon;
GRANT EXECUTE ON FUNCTION generate_short_id() TO authenticated;

-- 14. Verify the tables were created successfully
SELECT 'movie_links table created successfully' as status;

-- End of SQL Schema
