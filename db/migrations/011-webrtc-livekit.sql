-- Le Repère Permis / WebRTC SFU. Schema metadata only (no video media in Neon).
-- Keep legacy segment live intact for older builds until new iOS clients are tested.
ALTER TABLE video_sessions ADD COLUMN IF NOT EXISTS webrtc_last_heartbeat_at timestamptz;
ALTER TABLE video_sessions ADD COLUMN IF NOT EXISTS webrtc_started_at timestamptz;
CREATE INDEX IF NOT EXISTS video_sessions_webrtc_live_idx
  ON video_sessions (webrtc_last_heartbeat_at DESC) WHERE live_status='live';
