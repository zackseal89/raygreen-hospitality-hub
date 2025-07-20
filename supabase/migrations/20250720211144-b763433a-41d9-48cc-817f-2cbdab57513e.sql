-- 5. Improve bookings table with better tracking
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_reference TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Generate unique booking reference for existing records
UPDATE public.bookings 
SET booking_reference = 'BK' || LPAD(EXTRACT(YEAR FROM created_at)::TEXT, 4, '0') || 
                        LPAD(EXTRACT(DOY FROM created_at)::TEXT, 3, '0') || 
                        LPAD((ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 4, '0')
WHERE booking_reference IS NULL;

-- 6. Add updated_at triggers for new tables
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