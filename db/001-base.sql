-- Run once using the Neon SQL editor, on the free test project.
CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY,email text NOT NULL, name text NOT NULL,role text NOT NULL DEFAULT 'student' CHECK(role IN ('student','teacher','admin')),created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS routes(id uuid PRIMARY KEY,author_id text NOT NULL REFERENCES users(id),name text NOT NULL,description text NOT NULL DEFAULT '',difficulty text NOT NULL CHECK(difficulty IN ('Facile','Intermédiaire','Avancé')),status text NOT NULL CHECK(status IN ('private','published')),source text NOT NULL CHECK(source IN ('gps','gpx')),created_at timestamptz DEFAULT now(),duration integer NOT NULL CHECK(duration>=0),distance double precision NOT NULL CHECK(distance>=0),geometry jsonb NOT NULL);
CREATE INDEX IF NOT EXISTS routes_author ON routes(author_id);
CREATE TABLE IF NOT EXISTS gps_coordinates(route_id uuid REFERENCES routes(id) ON DELETE CASCADE,seq integer NOT NULL,lat double precision NOT NULL CHECK(lat BETWEEN -90 AND 90),lng double precision NOT NULL CHECK(lng BETWEEN -180 AND 180),accuracy double precision NOT NULL,recorded_at timestamptz NOT NULL,segment integer NOT NULL,PRIMARY KEY(route_id,seq));
CREATE TABLE IF NOT EXISTS pedagogical_points(id uuid PRIMARY KEY,route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,name text NOT NULL,category text NOT NULL,fix_index integer NOT NULL,question text NOT NULL,options jsonb NOT NULL,answer integer NOT NULL,explanation text NOT NULL,validated_by text REFERENCES users(id));
CREATE TABLE IF NOT EXISTS photographs(id uuid PRIMARY KEY,point_id uuid NOT NULL REFERENCES pedagogical_points(id) ON DELETE CASCADE,data_url text NOT NULL);
CREATE TABLE IF NOT EXISTS assignments(route_id uuid REFERENCES routes(id) ON DELETE CASCADE,student_id text REFERENCES users(id) ON DELETE CASCADE,assigned_by text NOT NULL REFERENCES users(id),PRIMARY KEY(route_id,student_id));
CREATE TABLE IF NOT EXISTS favorites(route_id uuid REFERENCES routes(id) ON DELETE CASCADE,user_id text REFERENCES users(id) ON DELETE CASCADE,PRIMARY KEY(route_id,user_id));
CREATE TABLE IF NOT EXISTS quiz_attempts(id uuid PRIMARY KEY,student_id text NOT NULL REFERENCES users(id),point_id uuid NOT NULL REFERENCES pedagogical_points(id) ON DELETE CASCADE,answer integer NOT NULL,correct boolean NOT NULL,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS progress(route_id uuid REFERENCES routes(id) ON DELETE CASCADE,student_id text REFERENCES users(id) ON DELETE CASCADE,fix_index integer NOT NULL DEFAULT 0,updated_at timestamptz DEFAULT now(),PRIMARY KEY(route_id,student_id));
-- Optional PostGIS, run separately if supported by your Neon project:
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- ALTER TABLE routes ADD COLUMN IF NOT EXISTS geom geometry(MultiLineString,4326);
-- UPDATE routes SET geom=ST_SetSRID(ST_GeomFromGeoJSON(geometry::text),4326);
-- CREATE INDEX routes_geom ON routes USING gist(geom);

CREATE TABLE IF NOT EXISTS app_settings(key text PRIMARY KEY,value text NOT NULL,updated_by text NOT NULL REFERENCES users(id),updated_at timestamptz NOT NULL DEFAULT now());
