-- Add Dei-Dei location if missing
INSERT INTO locations (name, slug)
VALUES ('Dei-Dei', 'dei-dei')
ON CONFLICT (slug) DO NOTHING;
