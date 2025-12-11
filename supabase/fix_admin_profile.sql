-- 1. Create a Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid duplication
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Manually fix the missing profile for 'airealentng@gmail.com'
-- This handles the case where the user already signed up before the trigger existed.
INSERT INTO public.profiles (id, role)
SELECT id, 'admin' -- <--- Make them ADMIN immediately
FROM auth.users
WHERE email = 'airealentng@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin'; -- If profile exists, just update role

-- 3. Verify
SELECT * FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'airealentng@gmail.com');
