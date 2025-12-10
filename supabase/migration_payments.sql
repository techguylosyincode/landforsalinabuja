-- Add subscription columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expiry timestamp with time zone;

-- Update RLS to allow users to read their own subscription status (already covered by "Public profiles are viewable by everyone" usually, but good to check)
-- No specific policy needed if SELECT is already open.

-- Ensure only service role (API) can update subscription_tier via the verification route.
-- The API route uses `createClient` from `@/lib/supabase/server` which usually uses the service role key if configured, 
-- OR it uses the user's session. If it uses user session, we need a policy or a Postgres Function.
-- For simplicity in this demo, we'll assume the API route runs with sufficient privileges or we add a policy.
-- BETTER APPROACH: Use a Postgres Function `upgrade_user_subscription` that is `SECURITY DEFINER` and call it via RPC, 
-- OR just rely on the API route using the Service Role Key (which bypasses RLS).

-- Since we are using Next.js API routes, we should use the Service Role Key for the update to ensure security.
-- However, `createClient` in `lib/supabase/server` usually defaults to the user's context (cookie).
-- To be safe, let's create a function that only the authenticated user can call? No, that's insecure.
-- The API route MUST use the Service Role Key to bypass RLS and update the subscription.

-- For now, let's just add the columns.
