-- Add onboarding-related columns to settings and profiles tables
-- This migration adds fields for tracking onboarding progress and storing user assets

-- Add onboarding tracking fields to settings
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS onboarding_step int DEFAULT 1;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS pdf_asset_path text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS video_asset_path text;

-- Add client information fields to profiles (if not already exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url text;
