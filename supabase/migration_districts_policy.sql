-- Enable RLS on districts (ensure it is on)
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
-- We use DO block to avoid error if policy already exists (though 'create policy if not exists' is supported in newer PG, Supabase sometimes needs care)
-- Actually, standard SQL doesn't have IF NOT EXISTS for policies in all versions, but Supabase PG15+ does.
-- Let's just try to drop and recreate to be safe and simple.

DROP POLICY IF EXISTS "Districts are viewable by everyone" ON districts;

CREATE POLICY "Districts are viewable by everyone"
ON districts FOR SELECT
USING (true);
