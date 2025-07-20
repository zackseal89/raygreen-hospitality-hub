
-- Phase 1: Database Cleanup & Simplification

-- 1. Clean up any existing problematic admin profiles
DELETE FROM public.profiles 
WHERE role = 'admin' AND (user_id IS NULL OR user_id = '');

-- 2. Create a simple function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Simplify all RLS policies to use the new function
-- Drop existing complex policies
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "bookings_admin_all" ON public.bookings;
DROP POLICY IF EXISTS "room_types_admin_all" ON public.room_types;
DROP POLICY IF EXISTS "menu_items_admin_all" ON public.menu_items;
DROP POLICY IF EXISTS "testimonials_admin_all" ON public.testimonials;
DROP POLICY IF EXISTS "conference_bookings_admin_all" ON public.conference_bookings;

-- Create simplified admin policies
CREATE POLICY "admin_profiles_all" ON public.profiles FOR ALL USING (is_current_user_admin());
CREATE POLICY "admin_bookings_all" ON public.bookings FOR ALL USING (is_current_user_admin());
CREATE POLICY "admin_room_types_all" ON public.room_types FOR ALL USING (is_current_user_admin());
CREATE POLICY "admin_menu_items_all" ON public.menu_items FOR ALL USING (is_current_user_admin());
CREATE POLICY "admin_testimonials_all" ON public.testimonials FOR ALL USING (is_current_user_admin());
CREATE POLICY "admin_conference_bookings_all" ON public.conference_bookings FOR ALL USING (is_current_user_admin());

-- 4. Create a function to promote a user to admin (for setup)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert or update profile to admin
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (target_user_id, 'admin', user_email)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin';
END;
$$;
