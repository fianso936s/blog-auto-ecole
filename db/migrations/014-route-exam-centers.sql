-- Backward compatible: old clients omit examCenter and retain the existing value.
ALTER TABLE routes ADD COLUMN IF NOT EXISTS exam_center text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS routes_exam_center_idx ON routes(lower(exam_center));
