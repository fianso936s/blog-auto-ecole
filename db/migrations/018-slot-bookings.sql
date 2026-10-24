-- A lesson booked on a teacher's slot: one student per slot, with who booked it and when the e-mails left.
ALTER TABLE teacher_slots ADD COLUMN IF NOT EXISTS student_id text REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE teacher_slots ADD COLUMN IF NOT EXISTS booked_by text REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE teacher_slots ADD COLUMN IF NOT EXISTS booked_at timestamptz;
ALTER TABLE teacher_slots ADD COLUMN IF NOT EXISTS notified_at timestamptz;
CREATE INDEX IF NOT EXISTS teacher_slots_student ON teacher_slots(student_id,starts_at) WHERE student_id IS NOT NULL;
