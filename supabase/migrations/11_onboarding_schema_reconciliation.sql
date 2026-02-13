-- Reconcile settings table
-- Using idempotent SQL to ensure columns exist with proper defaults and NOT NULL constraints
-- This helps stabilize the PostgREST schema cache and prevents intermittent errors

ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS pdf_asset_path text,
ADD COLUMN IF NOT EXISTS video_asset_path text;

-- Reconcile profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS rep_name text,
ADD COLUMN IF NOT EXISTS company_url text;

-- Ensure indexes for performance on foreign keys and primary lookups
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
