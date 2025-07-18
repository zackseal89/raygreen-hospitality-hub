-- Fix infinite recursion in profiles policies by creating a security definer function
-- Drop the problematic policies first
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Create a security definer function to check user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Recreate the admin policy using the security definer function
CREATE POLICY "profiles_admin_all" 
ON public.profiles 
FOR ALL 
USING (
  (auth.uid() IS NOT NULL) AND 
  (public.get_current_user_role() = 'admin')
);

-- Also fix similar issues in other tables that reference profiles for admin access
DROP POLICY IF EXISTS "room_types_admin_all" ON public.room_types;
DROP POLICY IF EXISTS "menu_items_admin_all" ON public.menu_items;
DROP POLICY IF EXISTS "testimonials_admin_all" ON public.testimonials;
DROP POLICY IF EXISTS "bookings_admin_all" ON public.bookings;
DROP POLICY IF EXISTS "conference_bookings_admin_all" ON public.conference_bookings;

-- Recreate admin policies for all tables using the security definer function
CREATE POLICY "room_types_admin_all" 
ON public.room_types 
FOR ALL 
USING (
  (auth.uid() IS NOT NULL) AND 
  (public.get_current_user_role() = 'admin')
);

CREATE POLICY "menu_items_admin_all" 
ON public.menu_items 
FOR ALL 
USING (
  (auth.uid() IS NOT NULL) AND 
  (public.get_current_user_role() = 'admin')
);

CREATE POLICY "testimonials_admin_all" 
ON public.testimonials 
FOR ALL 
USING (
  (auth.uid() IS NOT NULL) AND 
  (public.get_current_user_role() = 'admin')
);

CREATE POLICY "bookings_admin_all" 
ON public.bookings 
FOR ALL 
USING (
  (auth.uid() IS NOT NULL) AND 
  (public.get_current_user_role() = 'admin')
);

CREATE POLICY "conference_bookings_admin_all" 
ON public.conference_bookings 
FOR ALL 
USING (
  (auth.uid() IS NOT NULL) AND 
  (public.get_current_user_role() = 'admin')
);