-- IMPORTANT: BEFORE RUNNING THIS SCRIPT
-- 1. Go to your Supabase Dashboard > Authentication > Users.
-- 2. Copy the 'User UID' of your user (or create one if none exists).
-- 3. Replace '62760ce7-8d89-42bc-99b7-8d1bdd25f09d' below with that UUID.

-- Example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

-- Insert Profile for the Agent (using your real User ID)
INSERT INTO profiles (id, role, full_name, agency_name, phone_number, is_verified, subscription_tier)
VALUES 
  ('62760ce7-8d89-42bc-99b7-8d1bdd25f09d', 'agent', 'Demo Agent', 'Abuja Prime Lands', '08001234567', true, 'premium')
ON CONFLICT (id) DO UPDATE 
SET role = 'agent', is_verified = true, subscription_tier = 'premium'; 
-- The above line ensures if you already have a profile, it gets upgraded to agent/premium

-- Insert Properties linked to your User ID
INSERT INTO properties (title, description, price, size_sqm, district, address, title_type, status, images, slug, agent_id, is_featured)
VALUES
  (
    'Prime Residential Plot in Guzape',
    'A fully fenced residential plot in the heart of Guzape. Perfect for a luxury duplex. The area is fully developed with tarred roads and electricity. C of O is available and verifiable.',
    45000000,
    600,
    'Guzape',
    'Plot 123, Diplomatic Zone, Guzape, Abuja',
    'C_of_O',
    'active',
    ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop'],
    'prime-residential-plot-guzape',
    '62760ce7-8d89-42bc-99b7-8d1bdd25f09d',
    true
  ),
  (
    'Commercial Plot in Maitama',
    'High-value commercial land suitable for a plaza or corporate headquarters. Located on a major road with high foot traffic.',
    350000000,
    1200,
    'Maitama',
    'Plot 55, Gana Street, Maitama, Abuja',
    'C_of_O',
    'active',
    ARRAY['https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1000&auto=format&fit=crop'],
    'commercial-plot-maitama',
    '62760ce7-8d89-42bc-99b7-8d1bdd25f09d',
    true
  ),
  (
    'Affordable Land in Lugbe',
    'Great investment opportunity in a rapidly developing area. Close to the airport road.',
    8000000,
    450,
    'Lugbe',
    'Lugbe 1 Extension, Abuja',
    'R_of_O',
    'active',
    ARRAY['https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?q=80&w=1000&auto=format&fit=crop'],
    'affordable-land-lugbe',
    '62760ce7-8d89-42bc-99b7-8d1bdd25f09d',
    true
  );

-- Insert Blog Posts linked to your User ID
INSERT INTO blog_posts (title, slug, content, published, author_id)
VALUES
  (
    'How to Verify C of O in Abuja',
    'how-to-verify-c-of-o-abuja',
    '<p>Buying land in Abuja requires due diligence. The most important step is verifying the Certificate of Occupancy (C of O).</p><h3>Step 1: Visit AGIS</h3><p>Go to the Abuja Geographic Information Systems (AGIS) office...</p>',
    true,
    '62760ce7-8d89-42bc-99b7-8d1bdd25f09d'
  ),
  (
    'Top 5 Developing Areas in Abuja for 2025',
    'top-developing-areas-abuja-2025',
    '<p>Abuja is expanding rapidly. Here are the top areas to watch: Idu, Karmo, and Lugbe...</p>',
    true,
    '62760ce7-8d89-42bc-99b7-8d1bdd25f09d'
  );
