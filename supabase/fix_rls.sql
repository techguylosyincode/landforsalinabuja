-- Fix Recursive RLS Policy
-- The policy "Admins can view all profiles" creates an infinite loop because it queries the profiles table, 
-- which triggers the policy again.
-- Since "Public profiles are viewable by everyone" already exists, this admin policy is redundant and dangerous.

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
 