-- Storage bucket for video clips
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos bucket
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add video and transcription fields to comedians table
ALTER TABLE comedians
ADD COLUMN IF NOT EXISTS video_path TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS transcription TEXT,
ADD COLUMN IF NOT EXISTS subtitles_url TEXT,
ADD COLUMN IF NOT EXISTS transcription_status TEXT DEFAULT 'none'
  CHECK (transcription_status IN ('none', 'pending', 'processing', 'completed', 'failed'));

-- Create a table to track transcription jobs
CREATE TABLE IF NOT EXISTS transcription_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comedian_id UUID REFERENCES comedians(id) ON DELETE CASCADE NOT NULL,
  video_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for transcription jobs
ALTER TABLE transcription_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transcription jobs"
ON transcription_jobs FOR SELECT
USING (
  comedian_id IN (SELECT id FROM comedians WHERE user_id = auth.uid())
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transcription_jobs_comedian ON transcription_jobs(comedian_id);
CREATE INDEX IF NOT EXISTS idx_transcription_jobs_status ON transcription_jobs(status);
