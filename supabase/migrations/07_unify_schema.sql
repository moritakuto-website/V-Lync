-- Ensure profiles columns match settings page and onboarding requirements
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_url text;

-- Ensure settings columns for onboarding progress and assets exist
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pdf_asset_path text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS video_asset_path text;
