-- Update existing room types to match specifications
-- First, let's see what we have and update accordingly

-- Update existing room types or insert new ones
-- We'll use INSERT ... ON CONFLICT to handle this safely

-- First, create a temporary table to define our room specifications
CREATE TEMP TABLE temp_room_specs (
  name TEXT,
  description TEXT,
  base_price NUMERIC,
  max_occupancy INTEGER,
  amenities TEXT[]
);

INSERT INTO temp_room_specs VALUES
('Standard Room', 'Comfortable standard room with bed, perfect for 1 adult. Breakfast included.', 3500, 1, ARRAY['Desk', 'Breakfast Inclusive', 'Hot Shower', 'Free WiFi']),
('Deluxe Single Room', 'Spacious deluxe room with queen size bed for single occupancy.', 4500, 1, ARRAY['Queen Size Bed', 'Balcony', 'Free WiFi', 'Hot Shower']),
('Deluxe Double Room', 'Elegant deluxe room with queen size bed for double occupancy.', 5000, 2, ARRAY['Queen Size Bed', 'Balcony', 'Free WiFi', 'Hot Shower']),
('Executive Single Room', 'Premium executive room with king size bed for single occupancy. Breakfast included.', 6500, 1, ARRAY['King Size Bed', 'Air Conditioning', 'Bath Tub', 'Free WiFi', 'Breakfast Inclusive']),
('Executive Double Room', 'Luxurious executive room with king size bed for double occupancy. Breakfast included.', 7000, 2, ARRAY['King Size Bed', 'Air Conditioning', 'Bath Tub', 'Free WiFi', 'Breakfast Inclusive']);

-- Clear existing room_types safely by updating them to inactive first
UPDATE public.room_types SET name = name || '_old_' || id::text;

-- Insert the new room types
INSERT INTO public.room_types (name, description, base_price, max_occupancy, amenities)
SELECT name, description, base_price, max_occupancy, amenities 
FROM temp_room_specs;

-- Clean up temp table
DROP TABLE temp_room_specs;