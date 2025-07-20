-- Fix admin profiles with null user_id
DELETE FROM public.profiles 
WHERE role = 'admin' AND user_id IS NULL;

-- Add constraint to prevent future null user_id entries
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;