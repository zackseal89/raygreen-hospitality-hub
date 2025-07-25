-- CRITICAL SECURITY FIX: Privilege Escalation Prevention
-- Remove ability for users to update their own roles

-- Step 1: Create secure user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'guest', 'staff');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'guest',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 2: Create secure role checking function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  RETURN (
    SELECT role::text FROM public.user_roles 
    WHERE user_id = $1 AND is_active = true
    ORDER BY assigned_at DESC
    LIMIT 1
  );
END;
$$;

-- Step 3: Create secure admin check function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  RETURN get_user_role(user_id) = 'admin';
END;
$$;

-- Step 4: Secure role assignment function (admin only)
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id UUID, new_role app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  -- Only admins can assign roles
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Insufficient privileges to assign roles';
  END IF;
  
  -- Deactivate existing roles
  UPDATE public.user_roles 
  SET is_active = false 
  WHERE user_id = target_user_id;
  
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
$$;

-- Step 5: RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Only admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "No direct deletes allowed" 
ON public.user_roles 
FOR DELETE 
USING (false);

-- Step 6: Migrate existing data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT user_id, role::app_role, created_at
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 7: Update get_current_user_role to use new table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  RETURN get_user_role(auth.uid());
END;
$$;

-- Step 8: Remove role from profiles table and restrict updates
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Update profiles RLS to prevent role-related updates
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Step 9: Create trigger for new user role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  -- Assign default guest role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'guest'::app_role);
  RETURN NEW;
END;
$$;

-- Update the existing trigger to use new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Step 10: Enhanced audit logging for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  severity TEXT DEFAULT 'info'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    new_values,
    created_at
  ) VALUES (
    auth.uid(),
    'security_event',
    'security_events',
    jsonb_build_object(
      'event_type', event_type,
      'severity', severity,
      'details', details,
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    ),
    now()
  );
END;
$$;