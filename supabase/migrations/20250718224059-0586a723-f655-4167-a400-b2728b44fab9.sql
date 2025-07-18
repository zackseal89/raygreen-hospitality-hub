-- Create room types table
CREATE TABLE public.room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  max_occupancy INTEGER NOT NULL,
  amenities TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_type_id UUID REFERENCES public.room_types(id) NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  special_requests TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create conference bookings table
CREATE TABLE public.conference_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  attendees INTEGER NOT NULL,
  event_type TEXT,
  requirements TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10,2),
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  review TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'guest',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conference_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for room_types (public read)
CREATE POLICY "room_types_select_all" ON public.room_types FOR SELECT USING (true);
CREATE POLICY "room_types_admin_all" ON public.room_types FOR ALL USING (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create policies for bookings
CREATE POLICY "bookings_select_own" ON public.bookings FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "bookings_insert_guest" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_admin_all" ON public.bookings FOR ALL USING (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create policies for conference_bookings
CREATE POLICY "conference_bookings_select_own" ON public.conference_bookings FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "conference_bookings_insert_guest" ON public.conference_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "conference_bookings_admin_all" ON public.conference_bookings FOR ALL USING (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create policies for menu_items (public read)
CREATE POLICY "menu_items_select_all" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_admin_all" ON public.menu_items FOR ALL USING (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create policies for testimonials (public read for featured)
CREATE POLICY "testimonials_select_featured" ON public.testimonials FOR SELECT USING (is_featured = true);
CREATE POLICY "testimonials_admin_all" ON public.testimonials FOR ALL USING (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Insert sample room types
INSERT INTO public.room_types (name, description, base_price, max_occupancy, amenities) VALUES
('Economy Single Room', 'Comfortable accommodation with 1 Queen Bed and City View, perfect for solo travelers or couples seeking quality at great value.', 4500.00, 2, ARRAY['Free breakfast', 'Desk', 'Air conditioning', 'Free WiFi', '1 Queen Bed', 'City View']),
('Deluxe Single Room', 'Elegant room featuring 1 Queen Bed with Private Balcony, offering enhanced comfort and scenic views.', 6500.00, 2, ARRAY['Free breakfast', 'Private Balcony', 'Air conditioning', 'Free WiFi', 'Mini-fridge', '1 Queen Bed']),
('Standard Double Room', 'Spacious accommodation ideal for small families or groups, providing comfort and convenience.', 8000.00, 3, ARRAY['Free breakfast', 'Work desk', 'Air conditioning', 'Free WiFi', 'Multiple beds']),
('Family Room', 'Generously sized room designed for families, featuring multiple beds and family-friendly amenities.', 12000.00, 6, ARRAY['Free breakfast', 'Family entertainment', 'Air conditioning', 'Free WiFi', 'Multiple beds', 'Family space']),
('Executive Suite', 'Luxurious accommodation with separate living area, perfect for business travelers and special occasions.', 18000.00, 4, ARRAY['Free breakfast', 'Separate living area', 'Premium toiletries', 'Concierge service', 'Air conditioning', 'Free WiFi']);

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category) VALUES
-- Main Course
('Ugali with Sukuma Wiki', 'Traditional Kenyan staple served with collard greens', 450.00, 'MAIN COURSE'),
('Nyama Choma', 'Grilled meat served with accompaniments', 1200.00, 'MAIN COURSE'),
('Fish Stew', 'Fresh Lake Victoria fish in rich tomato sauce', 900.00, 'MAIN COURSE'),
('Chicken Curry', 'Aromatic chicken curry with rice', 850.00, 'MAIN COURSE'),
('Beef Pilau', 'Spiced rice with tender beef', 750.00, 'MAIN COURSE'),

-- Raygreen Special
('Raygreen Sunset Platter', 'Signature mixed grill with local specialties', 1500.00, 'RAYGREEN SPECIAL'),
('Lake Victoria Special', 'Fresh tilapia with traditional sides', 1300.00, 'RAYGREEN SPECIAL'),
('Kisumu Delight', 'Local delicacies sampler', 1100.00, 'RAYGREEN SPECIAL'),

-- Kids Menu
('Mini Chicken & Chips', 'Child-sized portion with vegetables', 400.00, 'ALA CARTE KIDS MENU'),
('Pasta with Sauce', 'Simple pasta with tomato sauce', 350.00, 'ALA CARTE KIDS MENU'),
('Fish Fingers & Rice', 'Crispy fish fingers with rice', 450.00, 'ALA CARTE KIDS MENU'),

-- Snacks
('Samosas', 'Crispy vegetable or meat samosas', 200.00, 'SNACKS'),
('Spring Rolls', 'Fresh spring rolls with dipping sauce', 250.00, 'SNACKS'),
('Chips Masala', 'Spiced potato chips', 300.00, 'SNACKS'),

-- Beverages
('Fresh Mango Juice', 'Locally sourced mango juice', 200.00, 'BEVERAGES'),
('Coffee', 'Freshly brewed Kenyan coffee', 150.00, 'BEVERAGES'),
('Cocktail of the Day', 'Ask our bartender for todays special', 500.00, 'BEVERAGES'),
('Tusker Beer', 'Local Kenyan beer', 250.00, 'BEVERAGES'),

-- Desserts
('Chocolate Cake', 'Rich chocolate cake slice', 350.00, 'DESSERT'),
('Fresh Fruit Salad', 'Seasonal tropical fruits', 250.00, 'DESSERT'),
('Ice Cream', 'Vanilla or chocolate scoop', 200.00, 'DESSERT');

-- Insert sample testimonials
INSERT INTO public.testimonials (customer_name, review, rating, is_featured) VALUES
('Nabi Joy', 'The food matches the ambience😍. Chef''s kiss. The rooftop also has a really nice view and the cocktails are to die for!!!! 10/10. The staff is quite friendly and welcoming. I look forward to visiting again.', 5, true),
('Emily M', 'The rooftop is the top tier 💯. Especially with the sunset view. Would highly recommend. The staff are very friendly and easy to talk to. The prices are quite fair. Ooh not forgetting their food. I have no words for them😍. Definitely a place to be.', 5, true),
('Chelsea J', 'I highly recommend. Their services are just as good as what they bring to the table. I had a pretty good time and I hope I get another opportunity to do it again. Satisfied client and customer here. Thank you.', 5, true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON public.room_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conference_bookings_updated_at BEFORE UPDATE ON public.conference_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();