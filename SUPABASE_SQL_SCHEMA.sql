-- MovieZone Complete SQL Schema for Supabase
-- Run these commands in your Supabase SQL Editor

-- 1. Create movie_links table
CREATE TABLE IF NOT EXISTS movie_links (
    id SERIAL PRIMARY KEY,
    movie_name TEXT NOT NULL,
    original_link TEXT NOT NULL,
    short_id TEXT NOT NULL UNIQUE,
    views INTEGER NOT NULL DEFAULT 0,
    date_added TIMESTAMP NOT NULL DEFAULT NOW(),
    ads_enabled BOOLEAN NOT NULL DEFAULT true
);

-- 2. Create api_tokens table for secure authentication
CREATE TABLE IF NOT EXISTS api_tokens (
    id SERIAL PRIMARY KEY,
    token_name TEXT NOT NULL,
    token_value TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_used TIMESTAMP
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movie_links_short_id ON movie_links(short_id);
CREATE INDEX IF NOT EXISTS idx_movie_links_date_added ON movie_links(date_added DESC);
CREATE INDEX IF NOT EXISTS idx_api_tokens_token_value ON api_tokens(token_value);
CREATE INDEX IF NOT EXISTS idx_api_tokens_active ON api_tokens(is_active);

-- 4. Insert a sample API token for testing (you can change this)
INSERT INTO api_tokens (token_name, token_value, is_active) 
VALUES ('Bot Token', 'moviezone_bot_token_2025_secure', true)
ON CONFLICT (token_value) DO NOTHING;

-- 5. Optional: Insert some sample data for testing
INSERT INTO movie_links (movie_name, original_link, short_id, views, ads_enabled) VALUES
('Sample Movie 1', 'https://example.com/movie1', 'abc123', 0, true),
('Sample Movie 2', 'https://example.com/movie2', 'def456', 5, true),
('Admin Created Movie', 'https://example.com/movie3', 'ghi789', 2, false)
ON CONFLICT (short_id) DO NOTHING;

-- 6. Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE movie_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for public access to movie_links (for redirect functionality)
CREATE POLICY "Allow public read access to movie_links" ON movie_links
    FOR SELECT USING (true);

CREATE POLICY "Allow public update views on movie_links" ON movie_links
    FOR UPDATE USING (true);

-- 8. Create policies for api_tokens (restrict access)
CREATE POLICY "Allow read access to active api_tokens" ON api_tokens
    FOR SELECT USING (is_active = true);

-- 9. Grant necessary permissions
GRANT ALL ON movie_links TO authenticated;
GRANT ALL ON api_tokens TO authenticated;
GRANT USAGE ON SEQUENCE movie_links_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE api_tokens_id_seq TO authenticated;

-- 10. Optional: Create a function to automatically update views
CREATE OR REPLACE FUNCTION increment_movie_views(short_id_param TEXT)
RETURNS void AS $$
BEGIN
    UPDATE movie_links 
    SET views = views + 1 
    WHERE short_id = short_id_param;
END;
$$ LANGUAGE plpgsql;

-- 11. Optional: Create a function to generate random short IDs
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(3), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 12. Verify the tables were created successfully
SELECT 'movie_links table created' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movie_links');

SELECT 'api_tokens table created' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_tokens');

-- End of SQL Schema