-- Drop and recreate functions to fix ambiguous column references

-- Drop existing functions that have parameter conflicts
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

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