-- Create missing tables referenced by edge functions

-- 1. Create external_portal_tokens table
CREATE TABLE public.external_portal_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on external_portal_tokens
ALTER TABLE public.external_portal_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for external_portal_tokens (admin only)
CREATE POLICY "external_portal_tokens_admin_full_access" 
ON public.external_portal_tokens 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 2. Create audit_logs table for security monitoring
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs (admin only for viewing, system for inserting)
CREATE POLICY "audit_logs_admin_select" 
ON public.audit_logs 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "audit_logs_system_insert" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- 3. Create menu_items table referenced by external portal
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_items
CREATE POLICY "menu_items_select_all" 
ON public.menu_items 
FOR SELECT 
USING (true);

CREATE POLICY "menu_items_admin_write" 
ON public.menu_items 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 4. Create webhook_notifications table referenced by realtime-webhook
CREATE TABLE public.webhook_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_name TEXT NOT NULL,
  webhook_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on webhook_notifications
ALTER TABLE public.webhook_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_notifications (admin only)
CREATE POLICY "webhook_notifications_admin_access" 
ON public.webhook_notifications 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 5. Fix database function security issues
-- Update get_current_user_role function with proper security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $function$
BEGIN
  RETURN (
    SELECT role FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$function$;

-- Update handle_new_user function with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', 'guest');
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function with proper security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update check_booking_overlap function with proper security
CREATE OR REPLACE FUNCTION public.check_booking_overlap()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  -- Check for overlapping bookings based on email and room
  IF EXISTS (
    SELECT 1 FROM bookings 
    WHERE guest_email = NEW.guest_email 
      AND room_type_id = NEW.room_type_id
      AND status IN ('pending', 'confirmed')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        (NEW.check_in_date >= check_in_date AND NEW.check_in_date < check_out_date) OR
        (NEW.check_out_date > check_in_date AND NEW.check_out_date <= check_out_date) OR
        (NEW.check_in_date <= check_in_date AND NEW.check_out_date >= check_out_date)
      )
  ) THEN
    RAISE EXCEPTION 'You already have a booking for these dates. Please check your email for existing bookings.';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add updated_at triggers for new tables
CREATE TRIGGER update_external_portal_tokens_updated_at
  BEFORE UPDATE ON public.external_portal_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create security monitoring function
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type TEXT,
  table_name TEXT DEFAULT NULL,
  record_id UUID DEFAULT NULL,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    auth.uid(),
    action_type,
    table_name,
    record_id,
    old_values,
    new_values,
    now()
  );
END;
$function$;