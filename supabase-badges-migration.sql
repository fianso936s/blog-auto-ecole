CREATE TABLE IF NOT EXISTS user_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
