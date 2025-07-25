-- SECURITY FIX: Address OTP and password security settings
-- Note: Some auth settings require manual configuration in Supabase Dashboard

-- Step 1: Create validation functions for input sanitization
CREATE OR REPLACE FUNCTION public.sanitize_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE STRICT
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

-- Step 2: Create rate limiting table for external portal access
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP address or token hash
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system functions can manage rate limits
CREATE POLICY "rate_limits_system_only" 
ON public.rate_limits 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Step 3: Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  identifier TEXT,
  action TEXT,
  max_requests INTEGER DEFAULT 100,
  window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE;
  current_count INTEGER;
BEGIN
  -- Calculate current window start (rounded to window_minutes)
  current_window := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::INTEGER / window_minutes) * 
    (window_minutes || ' minutes')::INTERVAL;
  
  -- Get current count for this window
  SELECT count INTO current_count 
  FROM public.rate_limits 
  WHERE rate_limits.identifier = check_rate_limit.identifier 
    AND rate_limits.action = check_rate_limit.action 
    AND window_start = current_window;
  
  -- If no record exists, create one
  IF current_count IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, window_start)
    VALUES (check_rate_limit.identifier, check_rate_limit.action, current_window);
    RETURN true;
  END IF;
  
  -- Check if under limit
  IF current_count < max_requests THEN
    UPDATE public.rate_limits 
    SET count = count + 1 
    WHERE rate_limits.identifier = check_rate_limit.identifier 
      AND rate_limits.action = check_rate_limit.action 
      AND window_start = current_window;
    RETURN true;
  END IF;
  
  -- Log rate limit violation
  PERFORM log_security_event(
    'rate_limit_exceeded',
    jsonb_build_object(
      'identifier', identifier,
      'action', action,
      'current_count', current_count,
      'max_requests', max_requests
    ),
    'warning'
  );
  
  RETURN false;
END;
$$;

-- Step 4: Create cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Remove records older than 24 hours
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - INTERVAL '24 hours';
END;
$$;

-- Step 5: Enhanced external portal token validation
CREATE OR REPLACE FUNCTION public.validate_portal_token_enhanced(
  token_hash TEXT,
  action TEXT DEFAULT 'api_access'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  token_record RECORD;
  rate_limit_ok BOOLEAN;
BEGIN
  -- Check rate limiting first
  rate_limit_ok := check_rate_limit(token_hash, action, 1000, 60);
  
  IF NOT rate_limit_ok THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'rate_limit_exceeded'
    );
  END IF;
  
  -- Validate token
  SELECT * INTO token_record
  FROM public.external_portal_tokens
  WHERE external_portal_tokens.token_hash = validate_portal_token_enhanced.token_hash
    AND is_active = true
    AND expires_at > now();
  
  IF NOT FOUND THEN
    -- Log invalid token attempt
    PERFORM log_security_event(
      'invalid_token_attempt',
      jsonb_build_object('token_hash_prefix', left(token_hash, 8)),
      'warning'
    );
    
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'invalid_or_expired_token'
    );
  END IF;
  
  -- Update last used timestamp
  UPDATE public.external_portal_tokens 
  SET last_used_at = now() 
  WHERE id = token_record.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'portal_name', token_record.portal_name,
    'permissions', token_record.permissions
  );
END;
$$;

-- Step 6: Create secure booking validation function
CREATE OR REPLACE FUNCTION public.validate_booking_data(
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  special_requests TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE STRICT
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