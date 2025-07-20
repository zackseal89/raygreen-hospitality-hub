
-- Remove user_id requirement from bookings table and update RLS policies
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policies that require authentication
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
DROP POLICY IF EXISTS "bookings_update_own" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_guest" ON bookings;

-- Create new RLS policies for guest bookings
CREATE POLICY "bookings_select_all" 
  ON bookings 
  FOR SELECT 
  USING (true);

CREATE POLICY "bookings_insert_guest" 
  ON bookings 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "bookings_update_guest" 
  ON bookings 
  FOR UPDATE 
  USING (true);

-- Add constraint to prevent duplicate bookings based on email + dates + room
CREATE UNIQUE INDEX idx_unique_guest_booking 
  ON bookings (guest_email, room_type_id, check_in_date, check_out_date)
  WHERE status IN ('pending', 'confirmed');

-- Update booking overlap trigger to work with guest bookings
CREATE OR REPLACE FUNCTION public.check_booking_overlap()
RETURNS trigger
LANGUAGE plpgsql
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

-- Create trigger for booking overlap check
DROP TRIGGER IF EXISTS booking_overlap_check ON bookings;
CREATE TRIGGER booking_overlap_check
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();

-- Add indexes for better performance on guest queries
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings (guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings (check_in_date, check_out_date);
