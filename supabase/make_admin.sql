-- Grant Admin Role to a User
-- Instructions:
-- 1. Replace 'your_email@gmail.com' with the email address you used to sign up.
-- 2. Run this script in the Supabase SQL Editor.

UPDATE profiles
SET role = 'admin'
WHERE id IN (
    SELECT id
    FROM auth.users
    WHERE email = 'airealentng@gmail.com' -- <--- REPLACE THIS EMAIL
);

-- Verify the update
SELECT * FROM profiles WHERE role = 'admin';
