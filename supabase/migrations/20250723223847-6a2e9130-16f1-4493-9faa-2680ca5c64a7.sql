-- Update the user role to admin for the logged in user
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE user_id = 'c17dc973-5dc9-4ae3-bd45-0b357c7b6e14';