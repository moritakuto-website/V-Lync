-- Ensure onboarding progress columns exist in settings
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 1;

ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
