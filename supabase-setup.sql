-- ============================================================
-- SCRIPT SQL COMPLET - Blog Auto-\u00c9cole
-- \u00c0 ex\u00e9cuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. TABLE PROFILES
-- Cr\u00e9\u00e9e automatiquement lors de l'inscription via le trigger
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. TABLE ARTICLES
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT DEFAULT '',
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les articles publi\u00e9s
CREATE POLICY "articles_public_read" ON articles
  FOR SELECT USING (published = true);

-- Les utilisateurs authentifi\u00e9s peuvent tout lire (y compris brouillons)
CREATE POLICY "articles_auth_read" ON articles
  FOR SELECT TO authenticated USING (true);

-- Les utilisateurs authentifi\u00e9s peuvent cr\u00e9er/modifier/supprimer
CREATE POLICY "articles_auth_insert" ON articles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "articles_auth_update" ON articles
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "articles_auth_delete" ON articles
  FOR DELETE TO authenticated USING (true);

-- 3. TABLE SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select" ON settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "settings_update" ON settings
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "settings_insert" ON settings
  FOR INSERT TO authenticated WITH CHECK (true);

-- Valeurs par d\u00e9faut
INSERT INTO settings (key, value) VALUES
  ('notification_email', ''),
  ('blog_name', 'Auto-Blog')
ON CONFLICT (key) DO NOTHING;

-- 4. TRIGGER : Cr\u00e9er un profil automatiquement \u00e0 l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe d\u00e9j\u00e0
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ARTICLES EXEMPLES (optionnel - \u00e0 ex\u00e9cuter si vous voulez du contenu de d\u00e9mo)
INSERT INTO articles (title, slug, excerpt, content, cover_image, category, author, published, created_at) VALUES
(
  '10 erreurs fatales \u00e0 \u00e9viter le jour de l''examen du permis',
  '10-erreurs-fatales-examen-permis',
  'Le jour J approche et le stress monte. D\u00e9couvrez les erreurs les plus courantes qui co\u00fbtent le permis aux candidats.',
  '<p>Le jour de l''examen du permis de conduire est souvent source de stress intense...</p><h2>1. Ne pas v\u00e9rifier ses r\u00e9troviseurs</h2><p>C''est l''erreur num\u00e9ro un.</p>',
  'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=500&fit=crop',
  'Conduite',
  'Sophie Martin',
  true,
  '2026-03-20T10:00:00Z'
),
(
  'R\u00e9forme du Code de la Route 2026 : ce qui change',
  'reforme-code-route-2026',
  'De nouvelles r\u00e8gles entrent en vigueur cette ann\u00e9e. Zones \u00e0 faibles \u00e9missions, trottinettes, v\u00e9los cargo...',
  '<p>L''ann\u00e9e 2026 apporte son lot de changements pour le Code de la Route fran\u00e7ais.</p>',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=500&fit=crop',
  'Code de la Route',
  'Marc Dupont',
  true,
  '2026-03-15T08:30:00Z'
),
(
  'Conduite de nuit : le guide complet pour les d\u00e9butants',
  'conduite-nuit-guide-debutants',
  'La conduite nocturne repr\u00e9sente 40% des accidents mortels en France. Apprenez les bons r\u00e9flexes.',
  '<p>Conduire la nuit demande des comp\u00e9tences sp\u00e9cifiques.</p>',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop',
  'S\u00e9curit\u00e9 Routi\u00e8re',
  'Sophie Martin',
  true,
  '2026-03-10T14:00:00Z'
)
ON CONFLICT (slug) DO NOTHING;

-- 6. CR\u00c9ER LE PREMIER ADMIN
-- Apr\u00e8s avoir cr\u00e9\u00e9 un compte via l'interface Supabase Auth,
-- ex\u00e9cutez cette requ\u00eate en rempla\u00e7ant l'email :
--
-- UPDATE profiles SET role = 'admin' WHERE email = 'VOTRE_EMAIL@exemple.com';
