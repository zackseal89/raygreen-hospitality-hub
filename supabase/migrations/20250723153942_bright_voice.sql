/*
  # Fix Economy Single Room Name

  1. Changes
    - Update "Economy Single Room_old_91a67426-b252-4fa9-..." to "Economy Single Room"
    - Clean up any malformed room names that contain "_old_" suffixes

  2. Security
    - Uses safe UPDATE operations
    - No destructive operations
*/

-- Update the Economy Single Room name to remove any "_old_" suffix and UUID
UPDATE public.room_types 
SET name = 'Economy Single Room'
WHERE name LIKE 'Economy Single Room_old_%';

-- Also ensure we have the correct Economy Single Room entry
INSERT INTO public.room_types (name, description, base_price, max_occupancy, amenities)
VALUES (
  'Economy Single Room',
  'Comfortable accommodation with 1 Queen Bed and City View, perfect for solo travelers or couples seeking quality at great value.',
  4500.00,
  2,
  ARRAY['Free breakfast', 'Desk', 'Air conditioning', 'Free WiFi', '1 Queen Bed', 'City View']
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  max_occupancy = EXCLUDED.max_occupancy,
  amenities = EXCLUDED.amenities;

-- Clean up any duplicate or malformed entries
DELETE FROM public.room_types 
WHERE name LIKE '%_old_%' AND name != 'Economy Single Room';