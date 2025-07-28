-- Update the phone number validation to allow local formats (starting with 0)
CREATE OR REPLACE FUNCTION public.validate_booking_data(guest_name text, guest_email text, guest_phone text, special_requests text)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE STRICT
 SET search_path TO 'public'
AS $function$
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
  -- Updated to allow local formats starting with 0 or international formats with +
  IF guest_phone IS NOT NULL AND length(guest_phone) > 0 THEN
    IF guest_phone !~ '^(\+?[1-9]\d{1,14}|0\d{8,14})$' THEN
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
$function$;