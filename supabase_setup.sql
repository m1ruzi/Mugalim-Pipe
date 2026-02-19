-- Supabase Setup Script for MugalimPipe
-- Run this in your Supabase SQL Editor

-- 1. Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  total_score INTEGER DEFAULT 0,
  percentage NUMERIC DEFAULT 0,
  grade TEXT DEFAULT 'N/A',
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_created ON reports(user_id, created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for RLS
-- Users can only view their own reports
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own reports
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reports
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;
CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Create storage bucket for PDF reports
-- Run this in Supabase Dashboard > Storage > Create bucket
-- Bucket name: reports
-- Public: false
-- File size limit: 10MB

-- 6. Create storage policies
-- Note: Run these in Supabase Dashboard > Storage > Policies
-- Or use SQL Editor:

INSERT INTO storage.policies (bucket_id, name, action, expression)
VALUES 
  ('reports', 'Users can upload their own reports', 'INSERT', 'bucket_id = ''reports'' AND auth.uid()::text = (storage.foldername(name))[1]'),
  ('reports', 'Users can view their own reports', 'SELECT', 'bucket_id = ''reports'' AND auth.uid()::text = (storage.foldername(name))[1]'),
  ('reports', 'Users can delete their own reports', 'DELETE', 'bucket_id = ''reports'' AND auth.uid()::text = (storage.foldername(name))[1]')
ON CONFLICT (bucket_id, name) DO NOTHING;

-- 7. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Setup complete!
-- Next steps:
-- 1. Create storage bucket named 'reports' in Supabase Dashboard
-- 2. Set bucket to private
-- 3. Set file size limit to 10MB (10485760 bytes)
