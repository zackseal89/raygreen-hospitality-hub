
-- Enable real-time functionality for all tables
ALTER TABLE public.room_types REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.conference_bookings REPLICA IDENTITY FULL;
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;
ALTER TABLE public.testimonials REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add all tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_types;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conference_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Create audit log table for tracking external portal changes
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'internal',
  external_portal_user TEXT
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for audit logs (admins can view all)
CREATE POLICY "audit_logs_admin_all" 
ON public.audit_logs 
FOR ALL 
USING (
  (auth.uid() IS NOT NULL) AND 
  (public.get_current_user_role() = 'admin')
);

-- Create a function to log changes
CREATE OR REPLACE FUNCTION public.log_audit_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, operation, old_data, changed_by, source)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), auth.uid(), 'internal');
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, operation, old_data, new_data, changed_by, source)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid(), 'internal');
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, operation, new_data, changed_by, source)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid(), 'internal');
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to all main tables
CREATE TRIGGER audit_room_types_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.room_types
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE TRIGGER audit_bookings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE TRIGGER audit_conference_bookings_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.conference_bookings
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE TRIGGER audit_menu_items_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

CREATE TRIGGER audit_testimonials_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

-- Create external portal access tokens table
CREATE TABLE public.external_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Enable RLS on external portal tokens
ALTER TABLE public.external_portal_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for external portal tokens (admins only)
CREATE POLICY "external_portal_tokens_admin_all" 
ON public.external_portal_tokens 
FOR ALL 
USING (
  (auth.uid() IS NOT NULL) AND 
  (public.get_current_user_role() = 'admin')
);
