-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add geometry column for venues
ALTER TABLE IF EXISTS "Venue" ADD COLUMN IF NOT EXISTS geom geometry(POINT,4326);

-- Populate geom from latitude/longitude for existing rows (if any)
UPDATE "Venue" SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE geom IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create spatial index on geom
CREATE INDEX IF NOT EXISTS idx_venue_geom ON "Venue" USING GIST (geom);

-- Trigram index for event title and venue name for fuzzy search
CREATE INDEX IF NOT EXISTS idx_event_title_trgm ON "Event" USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_venue_name_trgm ON "Venue" USING GIN (name gin_trgm_ops);

-- Index on event startAt and status
CREATE INDEX IF NOT EXISTS idx_event_start_at ON "Event" (startAt);
CREATE INDEX IF NOT EXISTS idx_event_status ON "Event" (status);
