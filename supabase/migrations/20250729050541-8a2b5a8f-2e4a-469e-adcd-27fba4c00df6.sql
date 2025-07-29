-- Add missing adults and children columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN adults integer NOT NULL DEFAULT 1,
ADD COLUMN children integer NOT NULL DEFAULT 0;

-- Add check constraints to ensure valid values
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_adults_positive CHECK (adults > 0),
ADD CONSTRAINT bookings_children_non_negative CHECK (children >= 0),
ADD CONSTRAINT bookings_total_guests_reasonable CHECK (adults + children <= 20);