-- Fix the bookings RLS policy to resolve permission denied for table users error

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;

-- Create a new simplified policy that doesn't access auth.users directly
CREATE POLICY "bookings_select_access" 
ON bookings 
FOR SELECT 
USING (
  -- Admin users can see all bookings
  get_current_user_role() = 'admin' 
  OR 
  -- Users can see their own bookings
  user_id = auth.uid()
  OR 
  -- Guest bookings (user_id is null) can be seen by anyone for now
  user_id IS NULL
);