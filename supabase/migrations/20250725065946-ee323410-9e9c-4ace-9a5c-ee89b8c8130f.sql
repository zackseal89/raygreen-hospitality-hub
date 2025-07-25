-- SECURITY FIX: Fix function search paths and complete security implementation

-- Fix sanitize_input function
CREATE OR REPLACE FUNCTION public.sanitize_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE STRICT
SET search_path TO 'public'
AS $$
BEGIN
  -- Remove potential SQL injection characters and limit length
  IF input_text IS NULL OR length(input_text) > 1000 THEN
    RETURN NULL;
  END IF;
  
  -- Basic sanitization - remove dangerous characters
  RETURN regexp_replace(
    regexp_replace(input_text, '[<>"\'';&]', '', 'g'),
    '\s+', ' ', 'g'
  );
END;
$$;

-- Fix validate_booking_data function
CREATE OR REPLACE FUNCTION public.validate_booking_data(
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  special_requests TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE STRICT
SET search_path TO 'public'
AS $$
DECLARE
  validation_errors TEXT[] := '{}';
BEGIN
  -- Validate guest name
  IF guest_name IS NULL OR length(trim(guest_name)) < 2 THEN
    validation_errors := array_append(validation_errors, 'Guest name must be at least 2 characters');
  END IF;
  
  IF length(guest_name) > 100 THEN
    validation_errors := array_append(validation_errors, 'Guest name must be less than 100 characters');
  END IF;
  
  -- Validate email format
  IF guest_email IS NULL OR guest_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    validation_errors := array_append(validation_errors, 'Valid email address is required');
  END IF;
  
  -- Validate phone (optional but if provided must be valid)
  IF guest_phone IS NOT NULL AND length(guest_phone) > 0 THEN
    IF guest_phone !~ '^\+?[1-9]\d{1,14}$' THEN
      validation_errors := array_append(validation_errors, 'Phone number format is invalid');
    END IF;
  END IF;
  
  -- Validate special requests length
  IF special_requests IS NOT NULL AND length(special_requests) > 500 THEN
    validation_errors := array_append(validation_errors, 'Special requests must be less than 500 characters');
  END IF;
  
  -- Return validation result
  IF array_length(validation_errors, 1) > 0 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'errors', validation_errors
    );
  ELSE
    RETURN jsonb_build_object('valid', true);
  END IF;
END;
$$;