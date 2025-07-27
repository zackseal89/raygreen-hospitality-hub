-- Fix ambiguous column references in database functions

-- Update get_user_role function to properly qualify column references
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  RETURN (
    SELECT ur.role::text FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.is_active = true
    ORDER BY ur.assigned_at DESC
    LIMIT 1
  );
END;
$function$;

-- Update is_admin function to use proper column qualification
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

-- Update assign_user_role function to use proper column qualification
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, new_role app_role)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  -- Only admins can assign roles
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Insufficient privileges to assign roles';
  END IF;
  
  -- Deactivate existing roles
  UPDATE public.user_roles 
  SET is_active = false 
  WHERE user_roles.user_id = target_user_id;
  
  -- Insert new role
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (target_user_id, new_role, auth.uid());
  
  -- Log the role change
  PERFORM log_admin_action(
    'role_assignment',
    'user_roles',
    NULL,
    jsonb_build_object('previous_role', get_user_role(target_user_id), 'target_user', target_user_id),
    jsonb_build_object('new_role', new_role, 'target_user', target_user_id)
  );
END;
$function$;