-- Quality Links Table Schema Update for MovieZone
-- Run this in your Supabase SQL Editor

-- Create quality_movie_links table for multi-quality downloads
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

-- Create indexes for better performance
CREATE INDEX idx_quality_movie_links_short_id ON quality_movie_links(short_id);
CREATE INDEX idx_quality_movie_links_date_added ON quality_movie_links(date_added DESC);

-- Enable Row Level Security
ALTER TABLE quality_movie_links ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all operations on quality_movie_links" ON quality_movie_links
    FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON quality_movie_links TO anon;
GRANT ALL ON quality_movie_links TO authenticated;
GRANT USAGE ON SEQUENCE quality_movie_links_id_seq TO anon;
GRANT USAGE ON SEQUENCE quality_movie_links_id_seq TO authenticated;

-- Verify table created successfully
SELECT 'Quality movie links table created successfully!' as status;