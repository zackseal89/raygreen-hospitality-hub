-- Remove old room types that have "_old_" in their names
DELETE FROM public.room_types 
WHERE name LIKE '%_old_%';

-- Verify we have only the correct 5 room types
SELECT name, base_price, max_occupancy, amenities 
FROM public.room_types 
ORDER BY base_price;