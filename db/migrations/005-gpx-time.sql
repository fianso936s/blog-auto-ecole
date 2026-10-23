-- A GPX without timestamps must never acquire a fabricated recording duration.
ALTER TABLE gps_coordinates ADD COLUMN IF NOT EXISTS recorded_time_known boolean NOT NULL DEFAULT true;
