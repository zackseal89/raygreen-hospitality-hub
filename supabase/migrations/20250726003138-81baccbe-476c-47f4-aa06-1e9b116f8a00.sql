-- Add booking_reference column to bookings table
ALTER TABLE public.bookings ADD COLUMN booking_reference TEXT;

-- Add unique constraint to booking_reference
ALTER TABLE public.bookings ADD CONSTRAINT bookings_booking_reference_unique UNIQUE (booking_reference);

-- Update the trigger to include booking_reference validation
CREATE OR REPLACE FUNCTION public.check_booking_overlap()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
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