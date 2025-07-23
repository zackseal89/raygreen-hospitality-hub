-- Create room_types table
CREATE TABLE public.room_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price NUMERIC NOT NULL,
  max_occupancy INTEGER NOT NULL DEFAULT 1,
  amenities TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to room types
CREATE POLICY "room_types_select_all" ON public.room_types
  FOR SELECT 
  USING (true);

-- Create policy for admin insert/update
CREATE POLICY "room_types_admin_write" ON public.room_types
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert the correct room types
INSERT INTO public.room_types (name, description, base_price, max_occupancy, amenities) VALUES
('Standard Room', 'Comfortable standard room with bed, perfect for 1 adult. Breakfast included.', 3500, 1, ARRAY['Desk', 'Breakfast Inclusive', 'Hot Shower', 'Free WiFi']),
('Deluxe Single Room', 'Spacious deluxe room with queen size bed for single occupancy.', 4500, 1, ARRAY['Queen Size Bed', 'Balcony', 'Free WiFi', 'Hot Shower']),
('Deluxe Double Room', 'Elegant deluxe room with queen size bed for double occupancy.', 5000, 2, ARRAY['Queen Size Bed', 'Balcony', 'Free WiFi', 'Hot Shower']),
('Executive Single Room', 'Premium executive room with king size bed for single occupancy. Breakfast included.', 6500, 1, ARRAY['King Size Bed', 'Air Conditioning', 'Bath Tub', 'Free WiFi', 'Breakfast Inclusive']),
('Executive Double Room', 'Luxurious executive room with king size bed for double occupancy. Breakfast included.', 7000, 2, ARRAY['King Size Bed', 'Air Conditioning', 'Bath Tub', 'Free WiFi', 'Breakfast Inclusive']);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_type_id UUID REFERENCES public.room_types(id) ON DELETE CASCADE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id TEXT,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings
CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT 
  USING (
    (user_id = auth.uid()) OR 
    (user_id IS NULL AND guest_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )) OR
    (get_current_user_role() = 'admin')
  );

CREATE POLICY "bookings_insert_guest" ON public.bookings
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "bookings_update_guest" ON public.bookings
  FOR UPDATE 
  USING (true);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT 
  USING (user_id = auth.uid() OR get_current_user_role() = 'admin');

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE 
  USING (user_id = auth.uid() OR get_current_user_role() = 'admin');

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to testimonials
CREATE POLICY "testimonials_select_all" ON public.testimonials
  FOR SELECT 
  USING (true);

-- Create policy for admin write access to testimonials
CREATE POLICY "testimonials_admin_write" ON public.testimonials
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample testimonials
INSERT INTO public.testimonials (name, content, rating) VALUES
('Sarah Johnson', 'Amazing experience at Raygreen Hotel! The staff was incredibly friendly and the rooms were spotless. The breakfast was delicious and the location perfect for exploring the city.', 5),
('Michael Chen', 'Outstanding service and beautiful rooms. The executive suite exceeded all expectations. Will definitely return on my next business trip to the area.', 5),
('Emma Williams', 'Wonderful stay! The hotel has a great atmosphere and the amenities are top-notch. The free WiFi was fast and the air conditioning worked perfectly.', 5);

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_room_types_updated_at
  BEFORE UPDATE ON public.room_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', 'guest');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create booking overlap prevention function
CREATE OR REPLACE FUNCTION public.check_booking_overlap()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for booking overlap check
CREATE TRIGGER booking_overlap_check
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();

-- Add indexes for better performance
CREATE INDEX idx_bookings_guest_email ON bookings (guest_email);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_dates ON bookings (check_in_date, check_out_date);
CREATE INDEX idx_bookings_room_type_id ON bookings (room_type_id);
CREATE INDEX idx_profiles_user_id ON profiles (user_id);
CREATE INDEX idx_profiles_role ON profiles (role);