-- Additive migration for LIVE near-real-time segment delivery: no video bytes in Neon.
ALTER TABLE video_sessions ADD COLUMN IF NOT EXISTS live_status text NOT NULL DEFAULT 'idle'
  CHECK (live_status IN ('idle','live','ended'));
ALTER TABLE video_sessions ADD COLUMN IF NOT EXISTS live_started_at timestamptz;
ALTER TABLE video_sessions ADD COLUMN IF NOT EXISTS live_ended_at timestamptz;
-- Original unnamed check requires uploaded file for publication. Live is published as segments arrive.
ALTER TABLE video_sessions DROP CONSTRAINT IF EXISTS video_sessions_check;
ALTER TABLE video_sessions ADD CONSTRAINT video_sessions_students_ready_or_live
  CHECK (visibility <> 'students' OR state='ready' OR live_status IN ('live','ended'));
CREATE TABLE IF NOT EXISTS video_segments (
  video_id uuid NOT NULL REFERENCES video_sessions(id) ON DELETE CASCADE,
  segment_index integer NOT NULL CHECK(segment_index BETWEEN 0 AND 100000),
  storage_key text UNIQUE NOT NULL,
  state text NOT NULL DEFAULT 'uploading' CHECK(state IN ('uploading','ready')),
  bytes bigint NOT NULL CHECK(bytes BETWEEN 1 AND 62914560),
  mime_type text NOT NULL DEFAULT 'video/mp4' CHECK(mime_type='video/mp4'),
  start_offset_ms bigint NOT NULL CHECK(start_offset_ms BETWEEN 0 AND 604800000),
  duration_ms integer NOT NULL CHECK(duration_ms BETWEEN 250 AND 120000),
  captured_at timestamptz NOT NULL DEFAULT now(),
  uploaded_at timestamptz,
  PRIMARY KEY(video_id,segment_index)
);
CREATE INDEX IF NOT EXISTS video_segments_playback ON video_segments(video_id,segment_index)
  WHERE state='ready';
-- A live may have discontinuities; server never invents the missing video.
