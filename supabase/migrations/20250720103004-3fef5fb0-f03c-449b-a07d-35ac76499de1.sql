
-- Add constraint to prevent duplicate bookings for the same user, room, and overlapping dates
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlapping bookings for authenticated users
  IF NEW.user_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM bookings 
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
$$ LANGUAGE plpgsql;

-- Create trigger for booking overlap check
DROP TRIGGER IF EXISTS check_booking_overlap_trigger ON bookings;
CREATE TRIGGER check_booking_overlap_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();

-- Add booking status management function
CREATE OR REPLACE FUNCTION update_booking_status(
  booking_id uuid,
  new_status text,
  admin_user_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Verify admin permission if admin_user_id is provided
  IF admin_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = admin_user_id AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Insufficient permissions to update booking status';
    END IF;
  END IF;
  
  -- Update booking status
  UPDATE bookings 
  SET status = new_status, updated_at = now()
  WHERE id = booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired pending bookings (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_expired_bookings()
RETURNS void AS $$
BEGIN
  UPDATE bookings 
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' 
    AND created_at < (now() - INTERVAL '24 hours')
    AND stripe_session_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies for better user booking management
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
CREATE POLICY "bookings_select_own" ON bookings
  FOR SELECT 
  USING (
    (user_id = auth.uid()) OR 
    (user_id IS NULL AND guest_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )) OR
    (get_current_user_role() = 'admin')
  );

-- Policy for users to update their own bookings (limited fields)
CREATE POLICY "bookings_update_own" ON bookings
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND 
    status IN ('pending') -- Only allow updates on pending bookings
  );
