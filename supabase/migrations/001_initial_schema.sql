-- Comedy Preview Widget - Initial Schema
-- Run this migration with: supabase db push

-- Comedians table (their profiles/"baseball cards")
CREATE TABLE IF NOT EXISTS comedians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  youtube_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clubs table (comedy venues)
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  website_url TEXT,
  widget_key UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: Which comedians appear at which clubs + ticket URLs
CREATE TABLE IF NOT EXISTS club_comedians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
  comedian_id UUID REFERENCES comedians(id) ON DELETE CASCADE NOT NULL,
  ticket_url TEXT NOT NULL,
  show_date DATE,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, comedian_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comedians_user ON comedians(user_id);
CREATE INDEX IF NOT EXISTS idx_clubs_user ON clubs(user_id);
CREATE INDEX IF NOT EXISTS idx_clubs_widget_key ON clubs(widget_key);
CREATE INDEX IF NOT EXISTS idx_club_comedians_club ON club_comedians(club_id);
CREATE INDEX IF NOT EXISTS idx_club_comedians_comedian ON club_comedians(comedian_id);

-- Row Level Security
ALTER TABLE comedians ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_comedians ENABLE ROW LEVEL SECURITY;

-- Comedians: anyone can read, owners can write
CREATE POLICY "Comedians are viewable by everyone"
  ON comedians FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own comedian profile"
  ON comedians FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comedian profile"
  ON comedians FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comedian profile"
  ON comedians FOR DELETE
  USING (auth.uid() = user_id);

-- Clubs: owners can manage, widget_key allows public read via club_comedians
CREATE POLICY "Clubs are viewable by everyone"
  ON clubs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own club"
  ON clubs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own club"
  ON clubs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own club"
  ON clubs FOR DELETE
  USING (auth.uid() = user_id);

-- Club comedians: public read, club owners can manage
CREATE POLICY "Club comedians viewable by everyone"
  ON club_comedians FOR SELECT
  USING (true);

CREATE POLICY "Club owners can insert comedians"
  ON club_comedians FOR INSERT
  WITH CHECK (
    club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid())
  );

CREATE POLICY "Club owners can update their comedians"
  ON club_comedians FOR UPDATE
  USING (
    club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid())
  );

CREATE POLICY "Club owners can delete their comedians"
  ON club_comedians FOR DELETE
  USING (
    club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid())
  );
