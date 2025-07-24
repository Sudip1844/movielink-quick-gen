-- Create table for movie links
CREATE TABLE public.movie_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_name TEXT NOT NULL,
  original_link TEXT NOT NULL,
  short_id TEXT NOT NULL UNIQUE,
  views INTEGER NOT NULL DEFAULT 0,
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ads_enabled BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.movie_links ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (assuming admins will be authenticated users)
CREATE POLICY "Allow authenticated users to view all movie links" 
ON public.movie_links 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert movie links" 
ON public.movie_links 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Allow authenticated users to update movie links" 
ON public.movie_links 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete movie links" 
ON public.movie_links 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_movie_links_updated_at
BEFORE UPDATE ON public.movie_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on short_id lookups
CREATE INDEX idx_movie_links_short_id ON public.movie_links(short_id);
CREATE INDEX idx_movie_links_date_added ON public.movie_links(date_added);
CREATE INDEX idx_movie_links_views ON public.movie_links(views);