-- Retries after a lost HTTP response must not turn a successful save into a conflict.
ALTER TABLE routes ADD COLUMN IF NOT EXISTS mobile_write_key text;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS mobile_write_hash text;
