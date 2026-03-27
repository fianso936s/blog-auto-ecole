-- Migration: Add REMC quiz support
-- Run this in your Supabase SQL editor

-- 1. Add competence_id to quiz_questions table
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS competence_id INTEGER;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_competence
ON quiz_questions(competence_id);

-- 2. Create quiz_results table (for student progress tracking)
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competence_id INTEGER, -- 1=C1, 2=C2, 3=C3, 4=C4, NULL=all
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for quiz_results
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Students can only see/insert their own results
CREATE POLICY "Users can insert own quiz results"
ON quiz_results FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz results"
ON quiz_results FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all results
CREATE POLICY "Admins can view all quiz results"
ON quiz_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id
ON quiz_results(user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_results_competence
ON quiz_results(competence_id);
