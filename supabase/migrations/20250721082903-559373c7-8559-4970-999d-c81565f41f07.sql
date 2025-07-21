-- Critical Security Fixes Migration

-- 1. Fix Role Escalation Vulnerability
-- Drop existing policy that allows users to update their own profiles (including role)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Create new policy that prevents users from updating their own role
CREATE POLICY "profiles_update_own_except_role" ON public.profiles
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() 
  AND (role IS NULL OR role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()))
);

-- Create admin-only policy for role updates
CREATE POLICY "profiles_admin_update_roles" ON public.profiles
FOR UPDATE
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

-- 2. Fix Database Function Security - Add SET search_path = '' to all functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT, 
  p_table_name TEXT, 
  p_record_id UUID DEFAULT NULL, 
  p_old_values JSONB DEFAULT NULL, 
  p_new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only log if user is admin
  IF public.is_current_user_admin() THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      p_action,
      p_table_name,
      p_record_id,
      p_old_values,
      p_new_values
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.booking_status_history (
      booking_id,
      old_status,
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      CASE 
        WHEN NEW.status = 'cancelled' THEN NEW.cancellation_reason
        ELSE NULL
      END
    );
    
    -- Log admin action
    PERFORM public.log_admin_action(
      'status_change',
      'bookings',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  ref_number TEXT;
  counter INTEGER;
BEGIN
  -- Generate reference: BK + YEAR + DAY_OF_YEAR + SEQUENCE
  SELECT COALESCE(MAX(CAST(RIGHT(booking_reference, 4) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.bookings
  WHERE booking_reference LIKE 'BK' || EXTRACT(YEAR FROM NEW.created_at)::TEXT || '%'
    AND DATE(created_at) = DATE(NEW.created_at);
  
  ref_number := 'BK' || 
                EXTRACT(YEAR FROM NEW.created_at)::TEXT || 
                LPAD(EXTRACT(DOY FROM NEW.created_at)::TEXT, 3, '0') || 
                LPAD(counter::TEXT, 4, '0');
  
  NEW.booking_reference := ref_number;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_booking_status(
  booking_id UUID, 
  new_status TEXT, 
  admin_user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verify admin permission if admin_user_id is provided
  IF admin_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = admin_user_id AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Insufficient permissions to update booking status';
    END IF;
  END IF;
  
  -- Update booking status
  UPDATE public.bookings 
  SET status = new_status, updated_at = now()
  WHERE id = booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_bookings()
RETURNS VOID
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  UPDATE public.bookings 
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' 
    AND created_at < (now() - INTERVAL '24 hours')
    AND stripe_session_id IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_booking_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Check for overlapping bookings for authenticated users
  IF NEW.user_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE user_id = NEW.user_id 
        AND room_type_id = NEW.room_type_id
        AND status IN ('pending', 'confirmed')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (
          (NEW.check_in_date >= check_in_date AND NEW.check_in_date < check_out_date) OR
          (NEW.check_out_date > check_in_date AND NEW.check_out_date <= check_out_date) OR
          (NEW.check_in_date <= check_in_date AND NEW.check_out_date >= check_out_date)
        )
    ) THEN
      RAISE EXCEPTION 'You already have a booking for these dates. Please check your existing bookings.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Create Missing Database Schema

-- Create external_portal_tokens table
CREATE TABLE IF NOT EXISTS public.external_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on external_portal_tokens
ALTER TABLE public.external_portal_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can manage external portal tokens
CREATE POLICY "external_portal_tokens_admin_all" ON public.external_portal_tokens
FOR ALL USING (is_current_user_admin());

-- Create audit_logs table for external portal actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  source TEXT DEFAULT 'internal',
  external_portal_user TEXT,
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_admin_all" ON public.audit_logs
FOR ALL USING (is_current_user_admin());

-- 4. Create secure role update function
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only admins can update roles
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Insufficient permissions to update user roles';
  END IF;

  -- Validate role
  IF new_role NOT IN ('admin', 'guest') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  -- Update the role
  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE user_id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Log the action
  PERFORM public.log_admin_action(
    'role_update',
    'profiles',
    target_user_id,
    jsonb_build_object('old_role', (SELECT role FROM public.profiles WHERE user_id = target_user_id)),
    jsonb_build_object('new_role', new_role)
  );
END;
$$;