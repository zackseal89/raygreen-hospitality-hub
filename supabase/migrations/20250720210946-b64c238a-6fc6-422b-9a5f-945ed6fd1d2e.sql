-- Phase 1: Database Schema Optimization & Organization

-- 1. Add audit trail for admin operations
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "admin_audit_log_admin_only" ON public.admin_audit_log 
FOR ALL USING (is_current_user_admin());

-- 2. Add room availability tracking
CREATE TABLE public.room_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available_rooms INTEGER NOT NULL DEFAULT 1,
  base_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(room_type_id, date)
);

-- Enable RLS on room availability
ALTER TABLE public.room_availability ENABLE ROW LEVEL SECURITY;

-- Public can read availability
CREATE POLICY "room_availability_public_read" ON public.room_availability 
FOR SELECT USING (true);

-- Only admins can modify availability
CREATE POLICY "room_availability_admin_modify" ON public.room_availability 
FOR ALL USING (is_current_user_admin());

-- 3. Add booking status history
CREATE TABLE public.booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on booking status history
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- Users can see their own booking history, admins can see all
CREATE POLICY "booking_history_user_own" ON public.booking_status_history 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = booking_id 
    AND (bookings.user_id = auth.uid() OR is_current_user_admin())
  )
);

-- Only admins can insert status changes
CREATE POLICY "booking_history_admin_insert" ON public.booking_status_history 
FOR INSERT WITH CHECK (is_current_user_admin());

-- 4. Add notification preferences
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  booking_confirmations BOOLEAN DEFAULT true,
  promotional_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences, admins can see all
CREATE POLICY "notification_prefs_user_own" ON public.notification_preferences 
FOR ALL USING (user_id = auth.uid() OR is_current_user_admin());

-- 5. Improve bookings table with better constraints and triggers
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_reference TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Generate unique booking reference
UPDATE public.bookings 
SET booking_reference = 'BK' || LPAD(EXTRACT(YEAR FROM created_at)::TEXT, 4, '0') || 
                        LPAD(EXTRACT(DOY FROM created_at)::TEXT, 3, '0') || 
                        LPAD((ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 4, '0')
WHERE booking_reference IS NULL;

-- Make booking reference required for new bookings
ALTER TABLE public.bookings ALTER COLUMN booking_reference SET NOT NULL;

-- 6. Add updated_at triggers for all tables
CREATE TRIGGER update_room_availability_updated_at
  BEFORE UPDATE ON public.room_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Only log if user is admin
  IF is_current_user_admin() THEN
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

-- 8. Create function to track booking status changes
CREATE OR REPLACE FUNCTION public.track_booking_status_change()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
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

-- Add trigger for booking status tracking
CREATE TRIGGER track_booking_status_changes
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.track_booking_status_change();

-- 9. Create function to generate booking reference
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TRIGGER
LANGUAGE PLPGSQL
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

-- Add trigger for booking reference generation
CREATE TRIGGER generate_booking_reference_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  WHEN (NEW.booking_reference IS NULL)
  EXECUTE FUNCTION public.generate_booking_reference();