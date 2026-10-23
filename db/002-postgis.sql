-- Optional: execute after schema.sql, only if PostGIS is available.
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS geom geometry(MultiLineString,4326);
CREATE OR REPLACE FUNCTION sync_route_geometry() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_GeomFromGeoJSON(NEW.geometry::text),4326);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS routes_geometry_sync ON routes;
CREATE TRIGGER routes_geometry_sync BEFORE INSERT OR UPDATE OF geometry ON routes FOR EACH ROW EXECUTE FUNCTION sync_route_geometry();
UPDATE routes SET geometry=geometry;
CREATE INDEX IF NOT EXISTS routes_geom ON routes USING gist(geom);
