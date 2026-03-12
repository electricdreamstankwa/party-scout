-- ============================================================
-- Party Scout — Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Events table
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  date_start    TIMESTAMPTZ NOT NULL,
  date_end      TIMESTAMPTZ,
  venue_name    TEXT,
  city          TEXT,
  country       TEXT,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  genres        TEXT[]  DEFAULT '{}',
  type          TEXT    DEFAULT 'club'  CHECK (type IN ('club','festival','open_air','virtual')),
  flyer_url     TEXT,
  lineup        TEXT[]  DEFAULT '{}',
  ticket_url    TEXT,
  ticket_affiliate_url TEXT,
  source        TEXT    DEFAULT 'manual',
  status        TEXT    DEFAULT 'pending' CHECK (status IN ('approved','pending','rejected')),
  external_id   TEXT UNIQUE,        -- prevents duplicate goabase imports
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast date queries
CREATE INDEX IF NOT EXISTS events_date_idx    ON events (date_start);
CREATE INDEX IF NOT EXISTS events_status_idx  ON events (status);
CREATE INDEX IF NOT EXISTS events_genres_idx  ON events USING GIN (genres);
CREATE INDEX IF NOT EXISTS events_location_idx ON events (lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- 2. Saved events (user bookmarks)
CREATE TABLE IF NOT EXISTS saved_events (
  user_id   UUID REFERENCES auth.users ON DELETE CASCADE,
  event_id  UUID REFERENCES events ON DELETE CASCADE,
  saved_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved events
CREATE POLICY "Public read approved events"
  ON events FOR SELECT
  USING (status = 'approved');

-- Anyone can submit an event (goes to pending)
CREATE POLICY "Public can submit events"
  ON events FOR INSERT
  WITH CHECK (status = 'pending');

-- Only authenticated users can save events
CREATE POLICY "Users manage their saved events"
  ON saved_events
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Sample data (optional — to test the app immediately)
-- ============================================================

INSERT INTO events (title, description, date_start, date_end, venue_name, city, country, lat, lng, genres, type, lineup, status, source)
VALUES
  (
    'Full Moon Gathering',
    'An outdoor psytrance experience under the stars. Come connect with nature and community.',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days 8 hours',
    'The Farm', 'Cape Town', 'South Africa',
    -33.9249, 18.4241,
    ARRAY['psytrance','ambient'], 'open_air',
    ARRAY['Astrix','Infected Mushroom','Vini Vici'],
    'approved', 'manual'
  ),
  (
    'Dark Room Techno Night',
    'Deep techno in an intimate industrial venue. Doors open at 22:00.',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days 6 hours',
    'Blank Projects', 'Cape Town', 'South Africa',
    -33.9281, 18.4186,
    ARRAY['techno'], 'club',
    ARRAY['Dax J','Rebekah'],
    'approved', 'manual'
  ),
  (
    'Sunrise Festival 2026',
    '3-day festival with camping and multiple stages in the Tankwa Karoo.',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '17 days',
    'Tankwa Karoo', 'Calvinia', 'South Africa',
    -31.4001, 19.7646,
    ARRAY['psytrance','techno','festival'], 'festival',
    ARRAY['Neelix','Ace Ventura','Pixel'],
    'approved', 'manual'
  ),
  (
    'Sonne Mond Sterne Preview',
    'Pre-festival warmup party.',
    NOW() + INTERVAL '20 days',
    NULL,
    'Watergate', 'Berlin', 'Germany',
    52.5009, 13.4474,
    ARRAY['techno','house'], 'club',
    ARRAY['Dixon','Âme'],
    'approved', 'manual'
  );
