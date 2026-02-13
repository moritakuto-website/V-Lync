-- Add prefectures array column to settings table
-- Allows users to select up to 3 prefectures for lead extraction
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS prefectures text[];
