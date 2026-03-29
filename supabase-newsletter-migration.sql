CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
