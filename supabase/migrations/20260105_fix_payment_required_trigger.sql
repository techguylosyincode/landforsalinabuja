-- Fix the auth trigger to set payment_required = true for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    payment_required,
    email_verified
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    true,  -- NEW USERS MUST PAY
    false  -- EMAIL NOT VERIFIED YET
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update any existing profiles that might have payment_required as null
UPDATE profiles
SET payment_required = true
WHERE payment_required IS NULL;
