-- First, temporarily drop the problematic RLS policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;

-- Drop the problematic functions
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;

-- Recreate get_user_role function with properly qualified column references
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id uuid DEFAULT auth.uid())
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN (
    SELECT ur.role::text FROM public.user_roles ur
    WHERE ur.user_id = target_user_id AND ur.is_active = true
    ORDER BY ur.assigned_at DESC
    LIMIT 1
  );
END;
$function$;

-- Recreate is_admin function 
CREATE OR REPLACE FUNCTION public.is_admin(target_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN get_user_role(target_user_id) = 'admin';
END;
$function$;

-- Recreate the RLS policies with the new function signatures
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING ((user_id = auth.uid()) OR is_admin());

CREATE POLICY "Only admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (is_admin());