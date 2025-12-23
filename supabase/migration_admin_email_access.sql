-- Migration: Allow admins to read emails from auth.users
-- Purpose: Enable admin agents page to display user emails
-- Safe to run multiple times (idempotent)

-- Create a function that allows admins to access auth.users emails
CREATE OR REPLACE FUNCTION public.get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN NULL; -- Non-admins get null
    END IF;

    -- Fetch email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;

    RETURN user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_email(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_user_email IS 'Allows admin users to retrieve email addresses from auth.users table';
