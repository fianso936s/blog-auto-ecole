-- Additive only. Unshared existing points stay private.
ALTER TABLE map_spots ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(photos) = 'array' AND jsonb_array_length(photos) <= 6);
ALTER TABLE map_spots ADD COLUMN IF NOT EXISTS share_with_students boolean NOT NULL DEFAULT false;
