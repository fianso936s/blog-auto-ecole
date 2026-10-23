-- Additive safety controls. No existing content or permissions are modified.
CREATE TABLE IF NOT EXISTS blocked_authors(user_id text REFERENCES users(id) ON DELETE CASCADE,author_id text REFERENCES users(id) ON DELETE CASCADE,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,author_id));
CREATE TABLE IF NOT EXISTS content_reports(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),reporter_id text REFERENCES users(id) ON DELETE SET NULL,kind text NOT NULL CHECK(kind IN ('route','spot','video')),resource_id uuid NOT NULL,reason text NOT NULL,details text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','dismissed','removed')),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(reporter_id,kind,resource_id));
CREATE TABLE IF NOT EXISTS hidden_content(kind text NOT NULL,resource_id uuid NOT NULL,moderated_by text REFERENCES users(id) ON DELETE SET NULL,created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(kind,resource_id));
CREATE INDEX IF NOT EXISTS reports_open ON content_reports(status,created_at);
CREATE TABLE IF NOT EXISTS auth_rate_limits(key text NOT NULL,bucket timestamptz NOT NULL,count integer NOT NULL DEFAULT 1,PRIMARY KEY(key,bucket));
GRANT SELECT,INSERT,UPDATE,DELETE ON blocked_authors,content_reports,hidden_content,auth_rate_limits TO repere_runtime;
