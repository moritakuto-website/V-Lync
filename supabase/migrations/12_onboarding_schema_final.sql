-- Final migration to ensure onboarding schema consistency across all environments
-- This migration reconciles the settings and profiles tables for the onboarding flow

-- Reconcile settings table
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

-- Ensure RLS policies are permissive for self-updates (if not already set)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own settings' AND tablename = 'settings') THEN
        CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;
