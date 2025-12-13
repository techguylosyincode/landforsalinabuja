-- Performance indexes for common queries

-- Properties
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_agent_status ON properties(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_properties_featured_created ON properties(is_featured, created_at DESC);

-- Districts
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);
