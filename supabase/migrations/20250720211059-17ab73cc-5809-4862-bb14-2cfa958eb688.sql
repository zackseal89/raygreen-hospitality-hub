-- Phase 1: Database Schema Optimization & Organization

-- 1. Add audit trail for admin operations
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "admin_audit_log_admin_only" ON public.admin_audit_log 
FOR ALL USING (is_current_user_admin());

-- 2. Add room availability tracking
CREATE TABLE public.room_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available_rooms INTEGER NOT NULL DEFAULT 1,
  base_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(room_type_id, date)
);

-- Enable RLS on room availability
ALTER TABLE public.room_availability ENABLE ROW LEVEL SECURITY;

-- Public can read availability
CREATE POLICY "room_availability_public_read" ON public.room_availability 
FOR SELECT USING (true);

-- Only admins can modify availability
CREATE POLICY "room_availability_admin_modify" ON public.room_availability 
FOR ALL USING (is_current_user_admin());

-- 3. Add booking status history
CREATE TABLE public.booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on booking status history
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- Users can see their own booking history, admins can see all
CREATE POLICY "booking_history_user_own" ON public.booking_status_history 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = booking_id 
    AND (bookings.user_id = auth.uid() OR is_current_user_admin())
  )
);

-- Only admins can insert status changes
CREATE POLICY "booking_history_admin_insert" ON public.booking_status_history 
FOR INSERT WITH CHECK (is_current_user_admin());

-- 4. Add notification preferences
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  booking_confirmations BOOLEAN DEFAULT true,
  promotional_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences, admins can see all
CREATE POLICY "notification_prefs_user_own" ON public.notification_preferences 
FOR ALL USING (user_id = auth.uid() OR is_current_user_admin());