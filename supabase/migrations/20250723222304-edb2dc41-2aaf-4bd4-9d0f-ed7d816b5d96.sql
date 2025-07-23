-- Create an admin user for testing
-- First, we'll create a function to safely create an admin profile

-- Create a function to create admin user profile
CREATE OR REPLACE FUNCTION create_admin_profile(
  admin_email TEXT DEFAULT 'admin@raygreenhotel.com',
  admin_name TEXT DEFAULT 'Hotel Administrator'
)
RETURNS TEXT AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Check if admin profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    RETURN 'Admin profile already exists';
  END IF;

  -- For now, we'll just create a profile entry that can be linked to a user later
  -- The actual user creation needs to be done through Supabase Auth
  
  -- Return instructions for manual admin creation
  RETURN 'Please create an admin user manually through Supabase Auth with email: ' || admin_email || ' and then update their profile role to admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Select the function result to show the message
SELECT create_admin_profile();

-- Drop the function after use
DROP FUNCTION create_admin_profile(TEXT, TEXT);