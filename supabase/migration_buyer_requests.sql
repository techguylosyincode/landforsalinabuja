-- Create buyer_requests table
CREATE TABLE IF NOT EXISTS buyer_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- Optional, if user is logged in
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    budget NUMERIC,
    location TEXT, -- e.g., "Guzape", "Maitama"
    property_type TEXT, -- e.g., "Land", "House"
    description TEXT,
    status TEXT DEFAULT 'open', -- open, closed, fulfilled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE buyer_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Everyone can insert (public form)
CREATE POLICY "Everyone can insert buyer requests" 
ON buyer_requests FOR INSERT 
WITH CHECK (true);

-- 2. Agents can view all requests (for now, we'll refine this to verified agents later)
-- Assuming agents are just authenticated users for this MVP step, or we can check a role.
-- For simplicity in this step: Authenticated users can view.
CREATE POLICY "Authenticated users can view requests" 
ON buyer_requests FOR SELECT 
TO authenticated 
USING (true);

-- 3. Users can view their own requests (if logged in)
CREATE POLICY "Users can view own requests" 
ON buyer_requests FOR SELECT 
USING (auth.uid() = user_id);
