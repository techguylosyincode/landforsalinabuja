-- FORCE ADMIN UPDATE
-- Run this script to guarantee the user is an Admin.

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Get the User ID from auth.users
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'airealentng@gmail.com';

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email airealentng@gmail.com not found in auth.users';
    END IF;

    -- 2. Upsert the Profile (Create if missing, Update if exists)
    INSERT INTO public.profiles (id, role, subscription_tier, is_verified)
    VALUES (target_user_id, 'admin', 'agency', true)
    ON CONFLICT (id) DO UPDATE
    SET 
        role = 'admin',
        subscription_tier = 'agency',
        is_verified = true;

END $$;

-- 3. Verify and Show Result
SELECT * FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'airealentng@gmail.com');
