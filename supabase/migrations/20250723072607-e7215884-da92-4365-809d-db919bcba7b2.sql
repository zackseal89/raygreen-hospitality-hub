-- First, clear existing room types
DELETE FROM public.room_types;

-- Insert the new room types as specified
INSERT INTO public.room_types (name, description, base_price, max_occupancy, amenities) VALUES
(
  'Standard Room',
  'Comfortable standard room with bed, perfect for 1 adult. Breakfast included.',
  3500,
  1,
  ARRAY['Desk', 'Breakfast Inclusive', 'Hot Shower', 'Free WiFi']
),
(
  'Deluxe Single Room',
  'Spacious deluxe room with queen size bed for single occupancy.',
  4500,
  1,
  ARRAY['Queen Size Bed', 'Balcony', 'Free WiFi', 'Hot Shower']
),
(
  'Deluxe Double Room',
  'Elegant deluxe room with queen size bed for double occupancy.',
  5000,
  2,
  ARRAY['Queen Size Bed', 'Balcony', 'Free WiFi', 'Hot Shower']
),
(
  'Executive Single Room',
  'Premium executive room with king size bed for single occupancy. Breakfast included.',
  6500,
  1,
  ARRAY['King Size Bed', 'Air Conditioning', 'Bath Tub', 'Free WiFi', 'Breakfast Inclusive']
),
(
  'Executive Double Room',
  'Luxurious executive room with king size bed for double occupancy. Breakfast included.',
  7000,
  2,
  ARRAY['King Size Bed', 'Air Conditioning', 'Bath Tub', 'Free WiFi', 'Breakfast Inclusive']
);