-- Phase 1: Database Schema Expansion

-- 1. Create Taxonomies Tables

-- Locations (Hierarchical: Abuja -> Districts)
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES locations(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Land Types (Residential, Commercial, etc.)
CREATE TABLE IF NOT EXISTS land_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estates (Gousa Estate, River Park, etc.)
CREATE TABLE IF NOT EXISTS estates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location_id UUID REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update Profiles Table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro', 'agency')),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- 3. Update Properties Table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS exact_size_sqm NUMERIC,
ADD COLUMN IF NOT EXISTS is_distressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_foundation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id),
ADD COLUMN IF NOT EXISTS land_type_id UUID REFERENCES land_types(id),
ADD COLUMN IF NOT EXISTS estate_id UUID REFERENCES estates(id);

-- 4. Enable RLS on new tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Public Read, Admin Write)

-- Locations
CREATE POLICY "Public can view locations" ON locations FOR SELECT USING (true);
-- (Admin write policy to be added later when Admin role is fully defined, for now open or manual)

-- Land Types
CREATE POLICY "Public can view land_types" ON land_types FOR SELECT USING (true);

-- Estates
CREATE POLICY "Public can view estates" ON estates FOR SELECT USING (true);

-- Admin Logs
-- Only admins can view/insert (Placeholder policy, assumes 'admin' role check exists or will be added)
-- CREATE POLICY "Admins can view logs" ON admin_logs FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 6. Seed Initial Data (Optional but recommended)
-- Insert basic Land Types
INSERT INTO land_types (name, slug) VALUES 
('Residential', 'residential'),
('Commercial', 'commercial'),
('Estate', 'estate'),
('Farm', 'farm'),
('Multipurpose', 'multipurpose'),
('Mass Housing', 'mass-housing')
ON CONFLICT (slug) DO NOTHING;

-- Insert basic Locations (Abuja Districts)
INSERT INTO locations (name, slug) VALUES 
('Idu', 'idu'),
('Guzape', 'guzape'),
('Katampe Extension', 'katampe-extension'),
('Airport Road', 'airport-road'),
('Apo', 'apo'),
('Asokoro', 'asokoro'),
('Dawaki', 'dawaki'),
('Gwarinpa', 'gwarinpa'),
('Jabi', 'jabi'),
('Jahi', 'jahi'),
('Lokogoma', 'lokogoma'),
('Maitama', 'maitama'),
('Wuye', 'wuye')
ON CONFLICT (slug) DO NOTHING;
