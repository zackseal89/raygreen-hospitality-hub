-- Enable real-time for bookings table
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- Add the bookings table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;