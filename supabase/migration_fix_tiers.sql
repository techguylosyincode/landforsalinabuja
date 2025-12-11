-- Fix Subscription Tiers to match new Monetization Strategy
-- Old values: 'free', 'premium'
-- New values: 'starter', 'pro', 'agency'

-- 1. Drop the old check constraint (if it exists)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

-- 2. Migrate existing data to new values
UPDATE profiles SET subscription_tier = 'starter' WHERE subscription_tier = 'free';
UPDATE profiles SET subscription_tier = 'pro' WHERE subscription_tier = 'premium';

-- 3. Add the new check constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
CHECK (subscription_tier IN ('starter', 'pro', 'agency'));

-- 4. Set the new default value
ALTER TABLE profiles ALTER COLUMN subscription_tier SET DEFAULT 'starter';

-- 5. Bonus: Auto-verify all Admins (so you get the Green Tick)
UPDATE profiles SET is_verified = true WHERE role = 'admin';
