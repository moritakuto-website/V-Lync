-- Add new columns to settings table
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS google_maps_key text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS auto_cleanup_90_days boolean default false;
