-- Migration: Expand Roles and Subscription Tiers for Onboarding Overhaul

-- 1. Drop existing check constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

-- 2. Add new check constraints with expanded values
-- Roles: 'user' (default), 'agent', 'agency', 'individual', 'admin'
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'agent', 'agency', 'individual', 'admin'));

-- Tiers: 'free', 'starter', 'pro', 'agency', 'premium' (keeping old ones for safety)
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
    CHECK (subscription_tier IN ('free', 'starter', 'pro', 'agency', 'premium'));

-- 3. Update existing 'free' tiers to 'starter' (Optional, but good for consistency)
UPDATE profiles SET subscription_tier = 'starter' WHERE subscription_tier = 'free';

-- 4. Ensure agency_name is present (it is in schema, but just to be safe/explicit if we need other fields)
-- (No action needed as agency_name exists)
