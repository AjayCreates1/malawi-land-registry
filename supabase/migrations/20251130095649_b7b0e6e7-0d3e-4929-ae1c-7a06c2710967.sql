-- Fix foreign keys to point to profiles instead of auth.users

-- Drop existing foreign keys that point to auth.users
ALTER TABLE public.land_registrations
DROP CONSTRAINT IF EXISTS land_registrations_applicant_id_fkey;

ALTER TABLE public.land_registrations
DROP CONSTRAINT IF EXISTS land_registrations_reviewed_by_fkey;

ALTER TABLE public.lands
DROP CONSTRAINT IF EXISTS lands_owner_id_fkey;

ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Add new foreign keys that point to profiles
ALTER TABLE public.land_registrations
ADD CONSTRAINT land_registrations_applicant_id_fkey
FOREIGN KEY (applicant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.land_registrations
ADD CONSTRAINT land_registrations_reviewed_by_fkey
FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.lands
ADD CONSTRAINT lands_owner_id_fkey
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;