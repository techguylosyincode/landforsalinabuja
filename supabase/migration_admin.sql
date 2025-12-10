-- Enable RLS on all tables (already done, but good to ensure)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy for Admins to view all profiles
-- Policy for Admins to view all profiles
-- REDUNDANT and CAUSES RECURSION: "Public profiles are viewable by everyone" covers this.
-- CREATE POLICY "Admins can view all profiles"
-- ON profiles FOR SELECT
-- USING (
--   auth.uid() IN (
--     SELECT id FROM profiles WHERE role = 'admin'
--   )
-- );

-- Policy for Admins to update all profiles (e.g., verify agents)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy for Admins to delete profiles (e.g., ban agents)
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy for Admins to view all properties (including pending/sold)
CREATE POLICY "Admins can view all properties"
ON properties FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy for Admins to update all properties (e.g., feature listings)
CREATE POLICY "Admins can update all properties"
ON properties FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy for Admins to delete properties
CREATE POLICY "Admins can delete properties"
ON properties FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
