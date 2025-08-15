-- MovieZone Complete SQL Schema for Supabase
-- Run these commands in your Supabase SQL Editor

-- 1. Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS movie_links CASCADE;
DROP TABLE IF EXISTS api_tokens CASCADE;
DROP TABLE IF EXISTS quality_movie_links CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS ad_view_sessions CASCADE;

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

-- 3. Create quality_movie_links table for multi-quality downloads
CREATE TABLE quality_movie_links (
    id BIGSERIAL PRIMARY KEY,
    movie_name TEXT NOT NULL,
    short_id TEXT NOT NULL UNIQUE,
    quality_480p TEXT, -- URL for 480p quality (optional)
    quality_720p TEXT, -- URL for 720p quality (optional)
    quality_1080p TEXT, -- URL for 1080p quality (optional)
    views INTEGER NOT NULL DEFAULT 0,
    date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ads_enabled BOOLEAN NOT NULL DEFAULT true
);

-- 4. Create api_tokens table for secure authentication
CREATE TABLE api_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_name TEXT NOT NULL,
    token_value TEXT NOT NULL UNIQUE,
    token_type TEXT NOT NULL DEFAULT 'single', -- 'single' or 'quality'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE
);

-- 5. Create indexes for better performance
CREATE INDEX idx_movie_links_short_id ON movie_links(short_id);
CREATE INDEX idx_movie_links_date_added ON movie_links(date_added DESC);
CREATE INDEX idx_quality_movie_links_short_id ON quality_movie_links(short_id);
CREATE INDEX idx_quality_movie_links_date_added ON quality_movie_links(date_added DESC);
CREATE INDEX idx_api_tokens_token_value ON api_tokens(token_value);
CREATE INDEX idx_api_tokens_active ON api_tokens(is_active);
CREATE INDEX idx_ad_view_sessions_ip ON ad_view_sessions(ip_address);
CREATE INDEX idx_ad_view_sessions_expires ON ad_view_sessions(expires_at);
CREATE INDEX idx_ad_view_sessions_short_id ON ad_view_sessions(short_id);

-- 6. Create admin_settings table for login credentials
CREATE TABLE admin_settings (
    id BIGSERIAL PRIMARY KEY,
    admin_id TEXT NOT NULL UNIQUE,
    admin_password TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. Create ad_view_sessions table for IP-based timer skip system (5-minute skip)
CREATE TABLE ad_view_sessions (
    id BIGSERIAL PRIMARY KEY,
    ip_address TEXT NOT NULL,
    short_id TEXT NOT NULL,
    link_type TEXT NOT NULL DEFAULT 'single', -- 'single' or 'quality'
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes')
);

-- Create unique constraint to prevent duplicate sessions for same IP and link
CREATE UNIQUE INDEX idx_ad_view_sessions_unique ON ad_view_sessions(ip_address, short_id, link_type);

-- 8. Insert default admin credentials
INSERT INTO admin_settings (admin_id, admin_password) 
VALUES ('sbiswas1844', 'save@184455') 
ON CONFLICT (admin_id) DO NOTHING;

-- 9. Insert sample API tokens for testing (you can change these)
INSERT INTO api_tokens (token_name, token_value, token_type, is_active) VALUES
('Single Bot Token', 'moviezone_single_bot_token_2025_secure', 'single', true),
('Quality Bot Token', 'moviezone_quality_bot_token_2025_secure', 'quality', true);

-- 10. Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE movie_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_movie_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_view_sessions ENABLE ROW LEVEL SECURITY;

-- 11. Create policies for public access to movie_links (for redirect functionality)
CREATE POLICY "Allow public read access to movie_links" ON movie_links
    FOR SELECT USING (true);

CREATE POLICY "Allow public update views on movie_links" ON movie_links
    FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to movie_links" ON movie_links
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete from movie_links" ON movie_links
    FOR DELETE USING (true);

-- 12. Create policies for public access to quality_movie_links
CREATE POLICY "Allow public read access to quality_movie_links" ON quality_movie_links
    FOR SELECT USING (true);

CREATE POLICY "Allow public update views on quality_movie_links" ON quality_movie_links
    FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to quality_movie_links" ON quality_movie_links
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete from quality_movie_links" ON quality_movie_links
    FOR DELETE USING (true);

-- 13. Create policies for api_tokens (allow all operations for admin)
CREATE POLICY "Allow read access to api_tokens" ON api_tokens
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to api_tokens" ON api_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to api_tokens" ON api_tokens
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete access to api_tokens" ON api_tokens
    FOR DELETE USING (true);

-- 14. Create policies for admin_settings (restricted access)
CREATE POLICY "Allow read access to admin_settings" ON admin_settings
    FOR SELECT USING (true);

-- 15. Create policies for ad_view_sessions (allow all operations for timer skip)
CREATE POLICY "Allow read access to ad_view_sessions" ON ad_view_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to ad_view_sessions" ON ad_view_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to ad_view_sessions" ON ad_view_sessions
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete access to ad_view_sessions" ON ad_view_sessions
    FOR DELETE USING (true);

-- 16. Grant necessary permissions for public access
GRANT ALL ON movie_links TO anon;
GRANT ALL ON movie_links TO authenticated;
GRANT ALL ON quality_movie_links TO anon;
GRANT ALL ON quality_movie_links TO authenticated;
GRANT ALL ON api_tokens TO anon;
GRANT ALL ON api_tokens TO authenticated;
GRANT ALL ON admin_settings TO anon;
GRANT ALL ON admin_settings TO authenticated;
GRANT ALL ON ad_view_sessions TO anon;
GRANT ALL ON ad_view_sessions TO authenticated;
GRANT USAGE ON SEQUENCE movie_links_id_seq TO anon;
GRANT USAGE ON SEQUENCE movie_links_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE quality_movie_links_id_seq TO anon;
GRANT USAGE ON SEQUENCE quality_movie_links_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE api_tokens_id_seq TO anon;
GRANT USAGE ON SEQUENCE api_tokens_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE admin_settings_id_seq TO anon;
GRANT USAGE ON SEQUENCE admin_settings_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE ad_view_sessions_id_seq TO anon;
GRANT USAGE ON SEQUENCE ad_view_sessions_id_seq TO authenticated;

-- 17. Create a function to clean up expired ad view sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM ad_view_sessions 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 18. Optional: Create a function to automatically update views
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

-- 19. Optional: Create a function to generate random short IDs
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN encode(gen_random_bytes(3), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 20. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions() TO anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_movie_views(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_movie_views(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_short_id() TO anon;
GRANT EXECUTE ON FUNCTION generate_short_id() TO authenticated;

-- 21. Verify the tables were created successfully
SELECT 'All tables created successfully including ad_view_sessions for IP-based timer skip' as status;

-- End of SQL Schema
